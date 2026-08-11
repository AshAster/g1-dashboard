"use client";

import React, { useState } from "react";
import { FeatureGate } from "@/app/components/feature-gate";
import { useChatState } from "./hooks/useChatState";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { ChatSidebar } from "./components/ChatSidebar";

export function ChatSimulatorModule() {
  const {
    messages, input, setInput, isLoading, showSources, setShowSources,
    selectedModel, setSelectedModel, availableModels, messagesEndRef,
    sendMessage, clearChat, sessions, activeSessionId, handleSelectSession, handleNewChat, handleDeleteSession
  } = useChatState();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <FeatureGate featureKey="chatSimulator">
      <div className="flex-1 flex flex-col md:flex-row bg-background h-[calc(100vh-7rem)] overflow-hidden relative">
        {isHistoryOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setIsHistoryOpen(false)}
          />
        )}

        <ChatSidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            handleSelectSession(id);
            setIsHistoryOpen(false);
          }}
          onNewChat={() => {
            handleNewChat();
            setIsHistoryOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
        
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full border-x border-border">
          <ChatHeader
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            availableModels={availableModels}
            messages={messages}
            clearChat={clearChat}
            onToggleSidebar={() => setIsHistoryOpen(!isHistoryOpen)}
          />

          <MessageList
            messages={messages}
            showSources={showSources}
            setShowSources={setShowSources}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </FeatureGate>
  );
}
