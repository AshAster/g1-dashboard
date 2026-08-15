import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Message } from "../types";
import {
  StoredSession,
  readSessions,
  writeSessions,
  readActiveSessionId,
  writeActiveSessionId,
  createSessionId,
  titleFromMessage,
} from "../storage";

export function useChatState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("groq/llama-3.3-70b-versatile");
  const [availableModels, setAvailableModels] = useState<string[]>([
    "groq/llama-3.3-70b-versatile",
    "groq/llama-3.1-8b-instant",
    "groq/mixtral-8x7b-32768",
    "groq/gemma2-9b-it",
    "llama3.2:latest",
  ]);
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [sectionPath, setSectionPath] = useState("");
  const [parentSection, setParentSection] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [includeParentContext, setIncludeParentContext] = useState(true);

  const [contextStrategy, setContextStrategy] = useState<"hierarchy" | "relevance" | "chronological" | "compress" | "standard">("hierarchy");
  const [enableQueryProcessing, setEnableQueryProcessing] = useState(true);
  const [useExtractedFilters, setUseExtractedFilters] = useState(true);

  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Sessions live in the browser only (localStorage) — no backend, no database.
  // Kept in a ref as well so async send/stream callbacks always persist against
  // the latest list rather than a stale render closure.
  const sessionsRef = useRef<StoredSession[]>([]);
  const activeSessionIdRef = useRef<string | null>(null);

  const commitSessions = (next: StoredSession[]) => {
    sessionsRef.current = next;
    setSessions(next);
    writeSessions(next);
  };

  const selectSessionId = (id: string | null) => {
    activeSessionIdRef.current = id;
    setActiveSessionId(id);
    writeActiveSessionId(id);
  };

  /** Persist a transcript against a saved session. */
  const persistMessages = (sessionId: string, msgs: Message[]) => {
    const next = sessionsRef.current.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            messages: msgs.map((m) => ({ ...m, isStreaming: false })),
            updated_at: new Date().toISOString(),
          }
        : s
    );
    commitSessions(next);
  };

  // Restore previous chats on mount.
  const hydrated = useRef(false);
  useEffect(() => {
    const stored = readSessions();
    sessionsRef.current = stored;
    setSessions(stored);

    const lastActive = readActiveSessionId();
    const restored = stored.find((s) => s.id === lastActive);
    if (restored) {
      activeSessionIdRef.current = restored.id;
      setActiveSessionId(restored.id);
      setMessages(restored.messages);
    }
    hydrated.current = true;
  }, []);

  // Save the transcript whenever it changes. Doing this in an effect (rather
  // than inside a setState updater) keeps writes out of the render phase so no
  // update is dropped, and the short debounce coalesces the rapid per-chunk
  // updates while a reply streams in. It deliberately does NOT wait for the
  // reply to finish — a message the user sent is saved even if the model call
  // is slow, fails, or the user navigates away mid-request.
  useEffect(() => {
    if (!hydrated.current) return;
    const id = activeSessionIdRef.current;
    if (!id) return;
    const session = sessionsRef.current.find((s) => s.id === id);
    if (!session) return;
    // Skip no-op writes so merely opening an old chat doesn't bump its position.
    const same =
      session.messages.length === messages.length &&
      session.messages.every(
        (m, i) => m.id === messages[i]?.id && m.content === messages[i]?.content
      );
    if (same) return;

    const timer = setTimeout(() => persistMessages(id, messages), 300);
    return () => clearTimeout(timer);
  }, [messages, activeSessionId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.getAvailableModels();
        if (res.data) {
          const models = (res.data as { models?: { id: string; name: string }[] }).models || [];
          if (models.length > 0) {
            setAvailableModels(models.map(m => m.id));
            setSelectedModel(models[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };
    fetchModels();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (promptText?: string) => {
    const text = promptText || input;
    if (!text.trim() || isLoading) return;

    // A chat is saved to "Previous Chats" the moment the first message is sent,
    // and that first message becomes its title.
    let currentSessionId = activeSessionIdRef.current;
    if (!currentSessionId) {
      const now = new Date().toISOString();
      const newSession: StoredSession = {
        id: createSessionId(),
        title: titleFromMessage(text),
        created_at: now,
        updated_at: now,
        messages: [],
      };
      currentSessionId = newSession.id;
      commitSessions([newSession, ...sessionsRef.current]);
      selectSessionId(currentSessionId);
    } else if (messages.length === 0) {
      // Fresh chat that already had an id (e.g. restored empty) — title it now.
      commitSessions(
        sessionsRef.current.map((s) =>
          s.id === currentSessionId ? { ...s, title: titleFromMessage(text) } : s
        )
      );
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await api.sendMessage(text, selectedDocIds.length > 0 ? selectedDocIds : undefined, {
        // No sessionId: chat history is stored in the browser, so there is no
        // server-side session to attach this message to.
        enableQueryProcessing,
        useExtractedFilters,
        sectionPath: sectionPath || undefined,
        parentSection: parentSection || undefined,
        includeParentContext,
        contentTypes: contentTypes.length > 0 ? contentTypes : undefined,
        contextStrategy,
        model: selectedModel,
      });
      
      if (res.error) {
        throw new Error(res.error);
      }

      const data = res.data as any;
      const response = data.message?.content || "No response received from the model.";
      const sources = data.sources || [];

      let currentContent = "";
      const chunkSize = 3;
      for (let i = 0; i < response.length; i += chunkSize) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        currentContent += response.slice(i, i + chunkSize);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: currentContent, sources: sources }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: response, sources: sources, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `Error: ${errorMessage}`, isStreaming: false }
            : msg
        )
      );
    }

    setIsLoading(false);
  };


  const handleSelectSession = (id: string) => {
    const session = sessionsRef.current.find((s) => s.id === id);
    if (!session) return;
    selectSessionId(id);
    setMessages(session.messages);
    setShowSources(null);
  };

  /**
   * Start a blank chat. Nothing is written to "Previous Chats" yet — the entry
   * appears (titled with the message) as soon as the first message is sent, so
   * abandoned empty chats never clutter the list.
   */
  const handleNewChat = () => {
    selectSessionId(null);
    setMessages([]);
    setShowSources(null);
  };

  const handleDeleteSession = (id: string) => {
    commitSessions(sessionsRef.current.filter((s) => s.id !== id));
    if (activeSessionIdRef.current === id) {
      selectSessionId(null);
      setMessages([]);
      setShowSources(null);
    }
  };

  /** Empty the current transcript but keep the saved chat itself. */
  const clearChat = () => {
    setMessages([]);
    setShowSources(null);
    if (activeSessionIdRef.current) {
      persistMessages(activeSessionIdRef.current, []);
    }
  };

  return {
    messages, input, setInput, isLoading, showSources, setShowSources,
    selectedModel, setSelectedModel, availableModels, messagesEndRef,
    showAdvancedOptions, setShowAdvancedOptions, sectionPath, setSectionPath,
    parentSection, setParentSection, contentTypes, setContentTypes,
    includeParentContext, setIncludeParentContext, contextStrategy, setContextStrategy,
    enableQueryProcessing, setEnableQueryProcessing, useExtractedFilters, setUseExtractedFilters,
    sendMessage, clearChat, selectedDocIds, setSelectedDocIds,
    sessions, activeSessionId, handleSelectSession, handleNewChat, handleDeleteSession
  };
}
