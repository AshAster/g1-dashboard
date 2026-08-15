import { Message } from "./types";

/**
 * Browser-local persistence for chat sessions.
 *
 * Sessions live entirely in localStorage — no database or backend involved.
 * A session is created the first time the user sends a message in a fresh
 * chat, and its title is that first message.
 */

const SESSIONS_KEY = "veda.chat.sessions";
const ACTIVE_KEY = "veda.chat.activeSessionId";
const TITLE_MAX = 50;

export interface StoredSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

const isBrowser = () => typeof window !== "undefined";

/** Turn the user's first message into a sidebar title. */
export function titleFromMessage(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New Chat";
  return clean.length > TITLE_MAX ? `${clean.slice(0, TITLE_MAX).trimEnd()}…` : clean;
}

/** Timestamps round-trip through JSON as strings; bring them back as Dates. */
function reviveMessages(raw: unknown): Message[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m: any) => ({
    ...m,
    timestamp: m?.timestamp ? new Date(m.timestamp) : new Date(),
    isStreaming: false,
  }));
}

export function readSessions(): StoredSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s: any) => s && typeof s.id === "string")
      .map((s: any) => ({
        id: s.id,
        title: typeof s.title === "string" && s.title ? s.title : "New Chat",
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.updated_at || s.created_at || new Date().toISOString(),
        messages: reviveMessages(s.messages),
      }))
      .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  } catch {
    return [];
  }
}

export function writeSessions(sessions: StoredSession[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    // Quota exceeded or storage disabled — keep the app usable either way.
    console.warn("[chat] could not persist sessions locally", e);
  }
}

export function readActiveSessionId(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function writeActiveSessionId(id: string | null): void {
  if (!isBrowser()) return;
  try {
    if (id) window.localStorage.setItem(ACTIVE_KEY, id);
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

export function createSessionId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
