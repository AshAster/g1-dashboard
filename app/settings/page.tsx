"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { RbacModule } from "@/app/features/rbac";
import { RollbackModule } from "@/app/features/rollback";
import { OtaUpdatesModule } from "@/app/features/ota-updates";
import { VoiceSettingsModule } from "@/app/features/voice-settings";

/**
 * Settings Page
 *
 * This page handles all system settings, including General, Security, API keys, and more.
 * UPDATED: Integrated VoiceSettingsModule into the Settings panel as a new tab ("voice").
 * UPDATED: Removed Localization, LLM models, and Webhooks tabs as requested.
 */


function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors cursor-pointer shrink-0",
        checked ? "bg-primary" : "bg-accent"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full absolute top-0.5 transition-all bg-white",
          checked ? "right-0.5" : "left-0.5"
        )}
      />
    </button>
  );
}

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: number;
  created_at: string;
  last_login: string | null;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [currentUserRole, setCurrentUserRole] = useState<string>("user");

  // General Settings State
  const [autoSave, setAutoSave] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [darkModeDefault, setDarkModeDefault] = useState(false);

  // LLM Settings State
  const [llmProvider, setLlmProvider] = useState("ollama");
  const [llmModel, setLlmModel] = useState("llama3.2:latest");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(0.9);
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant. Answer questions based on the provided context.");

  // Embedding Settings State
  const [embeddingModel, setEmbeddingModel] = useState("nomic-embed-text:latest");
  const [embeddingProvider, setEmbeddingProvider] = useState("ollama");
  const [embeddingDimension, setEmbeddingDimension] = useState(768);

  // Chunking Settings State
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [chunkingStrategy, setChunkingStrategy] = useState("semantic");
  const [batchSize, setBatchSize] = useState(32);

  // Vector DB Settings State
  const [vectorDb, setVectorDb] = useState("chroma");
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [topK, setTopK] = useState(5);

  // API Keys State
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [cohereKey, setCohereKey] = useState("");

  // Manage Users State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Security State
  const [oldPassword, setOldPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadSettings();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (activeTab === "users" && currentUserRole === "admin") {
      loadUsers();
    }
  }, [activeTab, currentUserRole]);

  const loadCurrentUser = async () => {
    const res = await api.getCurrentUser();
    if (res.data) {
      const u = res.data as { role?: string };
      setCurrentUserRole(u.role ?? "user");
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUserError("");
    const res = await api.listUsers();
    if (res.error) {
      setUserError("Failed to load users.");
    } else {
      setUsers((res.data as UserRecord[]) ?? []);
    }
    setUsersLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    const res = await api.createUser({ username: newUsername, email: newEmail, password: newPassword, role: newRole });
    if (res.error) {
      setCreateError(typeof res.error === "string" ? res.error : "Failed to create user.");
    } else {
      setShowCreateForm(false);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      loadUsers();
    }
    setCreateLoading(false);
  };

  const handleToggleActive = async (user: UserRecord) => {
    await api.updateUser(user.id, { is_active: user.is_active ? 0 : 1 });
    loadUsers();
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await api.deleteUser(userId);
    loadUsers();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus("saving");
    setPasswordError("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword: changeNewPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }
      setPasswordStatus("success");
      setOldPassword("");
      setChangeNewPassword("");
      setTimeout(() => setPasswordStatus("idle"), 3000);
    } catch (err: any) {
      setPasswordStatus("error");
      setPasswordError(err.message || "Something went wrong");
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSettings();
      if (res.data) {
        const s = res.data as Record<string, any>;
        if (s.llm_provider) setLlmProvider(s.llm_provider);
        if (s.llm_model) setLlmModel(s.llm_model);
        if (s.temperature !== undefined) setTemperature(s.temperature);
        if (s.max_tokens) setMaxTokens(s.max_tokens);
        if (s.top_p !== undefined) setTopP(s.top_p);
        if (s.system_prompt) setSystemPrompt(s.system_prompt);
        if (s.embedding_provider) setEmbeddingProvider(s.embedding_provider);
        if (s.embedding_model) setEmbeddingModel(s.embedding_model);
        if (s.embedding_dimensions) setEmbeddingDimension(s.embedding_dimensions);
        if (s.chunk_size) setChunkSize(s.chunk_size);
        if (s.chunk_overlap !== undefined) setChunkOverlap(s.chunk_overlap);
        if (s.chunking_strategy) setChunkingStrategy(s.chunking_strategy);
        if (s.batch_size) setBatchSize(s.batch_size);
        if (s.vector_db_type) setVectorDb(s.vector_db_type);
        if (s.similarity_threshold !== undefined) setSimilarityThreshold(s.similarity_threshold);
        if (s.top_k) setTopK(s.top_k);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaveStatus("saving");
    try {
      const s = {
        llm_provider: llmProvider, llm_model: llmModel, temperature, max_tokens: maxTokens,
        top_p: topP, system_prompt: systemPrompt, embedding_provider: embeddingProvider,
        embedding_model: embeddingModel, embedding_dimensions: embeddingDimension,
        chunk_size: chunkSize, chunk_overlap: chunkOverlap, chunking_strategy: chunkingStrategy,
        batch_size: batchSize, vector_db_type: vectorDb, similarity_threshold: similarityThreshold,
        top_k: topK,
        openai_api_key: openaiKey || undefined,
        anthropic_api_key: anthropicKey || undefined,
        cohere_api_key: cohereKey || undefined,
      };
      const res = await api.updateSettings(s);
      setSaveStatus(res.error ? "error" : "saved");
      if (!res.error) setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  };

  const allTabs = [
    { id: "general", label: "General", adminOnly: false, hidden: false, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    { id: "security", label: "Security", adminOnly: false, hidden: false, icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { id: "embedding", label: "Embedding", adminOnly: false, hidden: true, icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "chunking", label: "Chunking", adminOnly: false, hidden: true, icon: "M4 7v10c0 2 1.5 3 3 3h10c1.5 0 3-1 3-3V7c0-2-1.5-3-3-3H7c-1.5 0-3 1-3 3z M9 12h6" },
    { id: "database", label: "Vector DB", adminOnly: false, hidden: true, icon: "M4 7v10c0 2 1.5 3 3 3h10c1.5 0 3-1 3-3V7c0-2-1.5-3-3-3H7c-1.5 0-3 1-3 3z" },
    { id: "api", label: "API Keys", adminOnly: false, hidden: false, icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
    { id: "voice", label: "Voice", adminOnly: false, hidden: false, icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
    
    { id: "rbac", label: "RBAC", adminOnly: true, hidden: false, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "rollback", label: "Rollback", adminOnly: false, hidden: false, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "ota", label: "OTA Updates", adminOnly: false, hidden: false, icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },

  ];

  const tabs = allTabs.filter(t => !t.hidden && (!t.adminOnly || currentUserRole === "admin"));
  const showSaveButton = !["users", "rbac", "rollback", "ota", "voice"].includes(activeTab);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-56 shrink-0 bg-card border border-border rounded-2xl p-2 md:sticky md:top-4 md:self-start">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-8px),transparent)] md:[mask-image:none]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    console.log(`[Settings] Switching to tab: ${tab.id}`);
                    setActiveTab(tab.id);
                  }}
                  className={cn(
                    "shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-11 transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  )}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "general" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">General Settings</h2>
                  <p className="text-muted-foreground">Configure system-wide preferences</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 py-4 border-b border-border">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">Auto-save conversations</p>
                      <p className="text-sm text-muted-foreground">Automatically save chat history</p>
                    </div>
                    <Toggle checked={autoSave} onChange={() => setAutoSave(!autoSave)} />
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4 border-b border-border">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">Show source citations</p>
                      <p className="text-sm text-muted-foreground">Display document references in AI responses</p>
                    </div>
                    <Toggle checked={showSources} onChange={() => setShowSources(!showSources)} />
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4 border-b border-border">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">Enable streaming responses</p>
                      <p className="text-sm text-muted-foreground">Stream AI responses in real-time</p>
                    </div>
                    <Toggle checked={streamingEnabled} onChange={() => setStreamingEnabled(!streamingEnabled)} />
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">Default to dark mode</p>
                      <p className="text-sm text-muted-foreground">Use dark theme by default</p>
                    </div>
                    <Toggle checked={darkModeDefault} onChange={() => setDarkModeDefault(!darkModeDefault)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">Security</h2>
                  <p className="text-muted-foreground">Manage your account credentials</p>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  {passwordStatus === "success" && (
                    <div className="p-3 text-sm text-success bg-success/10 border border-success/20 rounded-lg">
                      Password successfully updated.
                    </div>
                  )}
                  {passwordStatus === "error" && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="current-password">Current Password</label>
                    <input id="current-password" 
                      type="password" 
                      required
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="new-password">New Password</label>
                    <input id="new-password" 
                      type="password" 
                      required
                      value={changeNewPassword} 
                      onChange={(e) => setChangeNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordStatus === "saving"}
                    className="w-full sm:w-auto min-h-11 px-6 py-2.5 rounded-xl font-medium transition-all bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordStatus === "saving" ? "Updating..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "embedding" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">Embedding Configuration</h2>
                  <p className="text-muted-foreground">Configure document embedding settings</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="provider">Provider</label>
                    <select id="provider" value={embeddingProvider} onChange={(e) => setEmbeddingProvider(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="ollama">Ollama (Local)</option>
                      <option value="openai">OpenAI</option>
                      <option value="cohere">Cohere</option>
                      <option value="huggingface">Hugging Face</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="embedding-model">Embedding Model</label>
                    <select id="embedding-model" value={embeddingModel} onChange={(e) => setEmbeddingModel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="nomic-embed-text:latest">Nomic Embed Text</option>
                      <option value="all-minilm:latest">All-MiniLM</option>
                      <option value="mxbai-embed-large:latest">MXBAI Embed Large</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="dimensions">Dimensions</label>
                    <input id="dimensions" type="number" value={embeddingDimension} onChange={(e) => setEmbeddingDimension(parseInt(e.target.value))}
                      min="128" max="4096"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chunking" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">Chunking Configuration</h2>
                  <p className="text-muted-foreground">Configure how documents are split for indexing</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="chunking-strategy">Chunking Strategy</label>
                    <select id="chunking-strategy" value={chunkingStrategy} onChange={(e) => setChunkingStrategy(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="semantic">Semantic (Recommended)</option>
                      <option value="fixed">Fixed Size</option>
                      <option value="recursive">Recursive</option>
                      <option value="markdown">Markdown Headers</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="batch-size">Batch Size</label>
                    <input id="batch-size" type="number" value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      min="1" max="100"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <p className="text-xs text-muted-foreground">Chunks to process in parallel</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="chunk-size-chunksize-tokens">Chunk Size ({chunkSize} tokens)</label>
                    <input id="chunk-size-chunksize-tokens" type="range" min="128" max="2048" step="64" value={chunkSize}
                      onChange={(e) => setChunkSize(parseInt(e.target.value))} className="w-full h-2 my-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110" />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>128</span><span>2048</span></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="chunk-overlap-chunkoverlap-tokens">Chunk Overlap ({chunkOverlap} tokens)</label>
                    <input id="chunk-overlap-chunkoverlap-tokens" type="range" min="0" max="256" step="16" value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(parseInt(e.target.value))} className="w-full h-2 my-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110" />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>0</span><span>256</span></div>
                  </div>
                </div>
                <div className="bg-accent/50 rounded-xl p-4 border border-border">
                  <p className="text-sm text-card-foreground font-medium mb-1">Estimated chunks per document</p>
                  <p className="text-sm text-muted-foreground">
                    A 5000 token document will create approximately {Math.ceil(5000 / (chunkSize - chunkOverlap))} chunks with these settings.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">Vector Database</h2>
                  <p className="text-muted-foreground">Configure vector search and storage</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="vector-database">Vector Database</label>
                    <select id="vector-database" value={vectorDb} onChange={(e) => setVectorDb(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="chroma">ChromaDB</option>
                      <option value="qdrant">Qdrant</option>
                      <option value="pinecone">Pinecone</option>
                      <option value="weaviate">Weaviate</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="top-k-results-topk">Top K Results ({topK})</label>
                    <input id="top-k-results-topk" type="range" min="1" max="20" step="1" value={topK}
                      onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full h-2 my-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110" />
                    <p className="text-xs text-muted-foreground">Number of chunks to retrieve</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="similarity-threshold-similaritythreshold">Similarity Threshold ({similarityThreshold})</label>
                    <input id="similarity-threshold-similaritythreshold" type="range" min="0" max="1" step="0.05" value={similarityThreshold}
                      onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))} className="w-full h-2 my-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary touch-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110" />
                    <p className="text-xs text-muted-foreground">Minimum similarity score</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 border-t border-border">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-card-foreground">Auto-optimize indices</p>
                    <p className="text-sm text-muted-foreground">Automatically optimize vector indices periodically</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">API Keys</h2>
                  <p className="text-muted-foreground">Manage your API credentials for external services</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="openai-api-key">OpenAI API Key</label>
                    <input id="openai-api-key" type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <p className="text-xs text-muted-foreground">Required for OpenAI models and embeddings</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="anthropic-api-key">Anthropic API Key</label>
                    <input id="anthropic-api-key" type="password" value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} placeholder="sk-ant-..."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <p className="text-xs text-muted-foreground">Required for Claude models</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground" htmlFor="cohere-api-key">Cohere API Key</label>
                    <input id="cohere-api-key" type="password" value={cohereKey} onChange={(e) => setCohereKey(e.target.value)} placeholder="..."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <p className="text-xs text-muted-foreground">Required for Cohere models and embeddings</p>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <p className="text-sm text-primary font-medium mb-1">Security Note</p>
                  <p className="text-sm text-muted-foreground">
                    API keys are stored locally and never sent to our servers.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "rbac" && <RbacModule />}
            {activeTab === "rollback" && <RollbackModule />}
            {activeTab === "ota" && <OtaUpdatesModule />}
            {activeTab === "voice" && (
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">Voice Settings</h2>
                  <p className="text-muted-foreground">Configure acoustic parameters and speech synthesis</p>
                </div>
                <VoiceSettingsModule />
              </div>
            )}
          </div>
        </div>

        {showSaveButton && activeTab !== "security" && (
          <div className="flex justify-end mt-6 sm:mt-8">
            <button
              onClick={saveSettings}
              disabled={saveStatus === "saving"}
              className={cn(
                "w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                saveStatus === "saving" ? "bg-muted text-muted-foreground cursor-wait"
                  : saveStatus === "saved" ? "bg-success text-white"
                  : saveStatus === "error" ? "bg-destructive text-white"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {saveStatus === "saving" ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>Saving...</>
              ) : saveStatus === "saved" ? (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>Saved!</>
              ) : saveStatus === "error" ? (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>Error Saving</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>Save Settings</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
