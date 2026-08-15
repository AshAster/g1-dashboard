"use client";

import { FiRefreshCw } from "react-icons/fi";
import { usePersonaContext } from "./context";

export function PersonaHeader() {
  const { source, fetchPersonas, loading } = usePersonaContext();
  
  return (
    <div className="border-b border-border pb-4 sm:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter uppercase text-foreground">
            Persona Manager
          </h1>
          <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest break-words">
            SYS.CONFIG // Configure system parameters and operational protocols
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchPersonas}
            className="p-2.5 border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            title="Reload from robot"
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 sm:mt-4">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${source === "robot" ? "bg-success animate-pulse" : source === "db" ? "bg-warning" : "bg-muted"}`} />
          <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase break-words">
            {source === "robot" ? "Reading from: Robot (live)" : source === "db" ? "Reading from: Database (robot offline)" : "Connecting..."}
          </span>
        </div>
      </div>
    </div>
  );
}
