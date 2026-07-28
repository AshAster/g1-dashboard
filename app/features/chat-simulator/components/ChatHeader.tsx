import React from "react";
import { Message } from "../types";

interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  messages: Message[];
  clearChat: () => void;
}

export function ChatHeader({
  selectedModel, setSelectedModel, availableModels, messages, clearChat
}: ChatHeaderProps) {
  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              Chat with your robot
              {selectedModel.startsWith("groq/") && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  Powered by Groq AI ⚡
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>
                  {model.startsWith("groq/") ? model.replace("groq/", "Groq: ") : model}
                </option>
              ))}
            </select>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
