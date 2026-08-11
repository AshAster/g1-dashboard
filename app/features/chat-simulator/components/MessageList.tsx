import React from "react";
import { Message } from "../types";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface MessageListProps {
  messages: Message[];
  showSources: string | null;
  setShowSources: (id: string | null) => void;
  sendMessage: (prompt: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const suggestedPrompts = [
  "Summarize my documents",
  "What are the key insights?",
  "Find related topics",
  "Explain the technical architecture",
  "Compare different approaches",
];

export function MessageList({ messages, showSources, setShowSources, sendMessage, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Start a conversation</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            Ask questions about your documents and get AI-powered answers with source citations
          </p>
          <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-xs sm:text-sm hover:opacity-85 hover:scale-[1.02] transition-all font-medium border border-border/40"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex gap-2.5 sm:gap-3 items-start w-full", 
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className={cn(
              "max-w-[80%] sm:max-w-[75%] space-y-1.5 flex flex-col",
              msg.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm shadow-xs transition-all duration-200 border",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground border-primary rounded-tr-none"
                  : "bg-card border-border text-card-foreground rounded-tl-none"
              )}>
                <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                )}
              </div>

              {msg.role === "assistant" && msg.sources && !msg.isStreaming && (
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={() => setShowSources(showSources === msg.id ? null : msg.id)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-accent/80 hover:bg-accent rounded-full text-[10px] font-medium text-accent-foreground transition-all border border-border/30"
                  >
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {msg.sources.length} Sources
                    <svg className={cn("w-2.5 h-2.5 ml-0.5 transition-transform", showSources === msg.id && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}

              {msg.role === "user" && (
                <span className="text-[10px] text-muted-foreground font-mono px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}

              {showSources === msg.id && msg.sources && (
                <div className="mt-2 space-y-2 w-full">
                  {msg.sources.map((source) => (
                    <div key={source.id} className="bg-accent/30 rounded-xl p-3 border border-border/60 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className="text-xs font-semibold text-card-foreground flex items-center gap-1.5 truncate">
                          <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{source.document}</span>
                          {source.page && <span className="text-muted-foreground font-normal shrink-0">• Page {source.page}</span>}
                        </span>
                        <span className="text-[9px] text-green-500 font-bold shrink-0 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/15">{(source.score * 100).toFixed(0)}% Match</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{source.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-semibold text-xs border border-primary/20">
                U
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

