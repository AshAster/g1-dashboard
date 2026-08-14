import React from "react";
import { Message } from "../types";

interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  messages: Message[];
  clearChat: () => void;
  onToggleSidebar?: () => void;
}

export function ChatHeader({
  selectedModel, setSelectedModel, availableModels, messages, clearChat, onToggleSidebar
}: ChatHeaderProps) {
  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile history toggle button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex-shrink-0"
              title="View Previous Chats"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-base md:text-xl font-semibold text-foreground flex items-center gap-2 truncate">
              <span className="truncate">Chat with your robot</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
