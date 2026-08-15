import React from "react";
import { WakeWordJob } from "../types";
import { StatusDot, statusColor } from "../helpers";

interface SystemStatusProps {
  backend: string;
  agxIp: string;
  maintStatus: { maintenance_mode: boolean; pipeline_running: boolean } | null;
  activeJob: WakeWordJob | null;
  maintLoading: boolean;
  toggleMaintenance: () => void;
}

export function SystemStatus({
  backend, agxIp, maintStatus, activeJob, maintLoading, toggleMaintenance
}: SystemStatusProps) {
  return (
    <section id="status" className="border-t border-border pt-6 sm:pt-8 scroll-mt-32 sm:scroll-mt-36">
      <div className="flex items-center gap-2.5 sm:gap-4 mb-5 sm:mb-8 min-w-0">
        <span className="text-primary font-mono text-xs sm:text-sm shrink-0">[01]</span>
        <h2 className="text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wide text-foreground">system status</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Backend */}
        <div className="border border-border bg-card/50 p-3 sm:p-4">
          <p className="text-xs font-mono text-muted-foreground uppercase mb-2">// training backend</p>
          <p className="text-base sm:text-lg font-mono font-bold text-primary uppercase break-words">
            {backend === "local_agx" ? "LOCAL AGX" : "KAGGLE CLOUD"}
          </p>
          <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1 break-words">
            {backend === "local_agx" ? `AGX IP: ${agxIp || "not detected"}` : "kaggle.com free GPU"}
          </p>
        </div>

        {/* Robot status */}
        <div className="border border-border bg-card/50 p-3 sm:p-4">
          <p className="text-xs font-mono text-muted-foreground uppercase mb-2">// robot pipeline</p>
          {maintStatus ? (
            <>
              <p className={`text-base sm:text-lg font-mono font-bold uppercase ${maintStatus.maintenance_mode ? "text-warning" : maintStatus.pipeline_running ? "text-success" : "text-muted-foreground"}`}>
                {maintStatus.maintenance_mode ? "MAINTENANCE" : maintStatus.pipeline_running ? "RUNNING" : "STOPPED"}
              </p>
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1 break-words">
                {maintStatus.maintenance_mode ? "GPU free for training" : "NLP pipeline active"}
              </p>
            </>
          ) : (
            <p className="text-base sm:text-lg font-mono font-bold text-muted-foreground uppercase">UNKNOWN</p>
          )}
        </div>

        {/* Active job */}
        <div className="border border-border bg-card/50 p-3 sm:p-4">
          <p className="text-xs font-mono text-muted-foreground uppercase mb-2">// active job</p>
          {activeJob ? (
            <>
              <div className="flex items-center gap-2">
                <StatusDot s={activeJob.status} />
                <p className={`text-base sm:text-lg font-mono font-bold uppercase ${statusColor(activeJob.status)}`}>
                  {activeJob.status.toUpperCase()}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1 break-words">
                "{activeJob.wake_phrase}" — job #{activeJob.id}
              </p>
            </>
          ) : (
            <p className="text-base sm:text-lg font-mono font-bold text-muted-foreground uppercase">IDLE</p>
          )}
        </div>
      </div>

      {/* Maintenance toggle — only for local_agx */}
      {backend === "local_agx" && agxIp && (
        <div className="mt-3 sm:mt-4 border border-border bg-card/30 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-foreground uppercase">Robot Maintenance Mode</p>
            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-0.5 break-words">
              Must be ON before training. Stops NLP pipeline to free GPU.
            </p>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={maintLoading || !!activeJob}
            className={`w-full sm:w-auto min-h-11 sm:min-h-0 px-4 py-2 text-xs font-mono uppercase border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              ${maintStatus?.maintenance_mode
                ? "border-warning/50 text-warning hover:bg-warning/10"
                : "border-success/50 text-success hover:bg-success/10"
              }`}
          >
            {maintLoading ? "..." : maintStatus?.maintenance_mode ? "[ STOP MAINTENANCE ]" : "[ START MAINTENANCE ]"}
          </button>
        </div>
      )}
    </section>
  );
}
