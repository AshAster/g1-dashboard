import React from "react";

export function UploadModal({ progress, show }: { progress: number, show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overscroll-contain">
      <div role="dialog" aria-modal="true" aria-labelledby="upload-modal-title" className="bg-card border border-border p-5 sm:p-8 max-w-md w-full max-h-[88dvh] overflow-y-auto overscroll-contain shadow-2xl">
        <h3 id="upload-modal-title" className="text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wide mb-2">Processing Documents</h3>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          // Indexing content for vector retrieval
        </p>
        
        <div className="h-2 w-full bg-secondary overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase break-words">Progress</span>
          <span className="text-sm font-bold font-mono">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
