import React from "react";

export function McpHeader() {
  return (
    <div className="border-b border-border pb-4 sm:pb-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter uppercase text-foreground">
        Protocol Server
      </h1>
      <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest break-words">
        SYS.MCP // Model Context Protocol Integration
      </p>
    </div>
  );
}
