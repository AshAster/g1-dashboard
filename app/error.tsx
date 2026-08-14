"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Feature crashed:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-card rounded-xl border border-destructive/20 m-6">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <FiAlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Module Temporarily Unavailable
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        An error occurred within this specific feature module. The rest of your platform remains fully operational and secure.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-destructive text-white rounded-lg font-medium hover:bg-destructive transition-colors"
      >
        Attempt Recovery
      </button>
      <div className="mt-8 text-xs font-mono text-destructive/50 bg-destructive/5 p-4 rounded text-left max-w-2xl overflow-auto hidden md:block">
        {error.message || "Unknown rendering error"}
      </div>
    </div>
  );
}
