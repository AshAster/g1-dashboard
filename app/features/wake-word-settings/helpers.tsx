import React from "react";
import { JobStatus } from "./types";

export function statusColor(s: JobStatus) {
  const map: Record<string, string> = {
    running: "text-warning",
    uploading: "text-warning",
    downloading: "text-warning",
    ready: "text-success",
    deployed: "text-success",
    error: "text-destructive",
    cancelled: "text-muted-foreground",
    queued: "text-blue-400",
  };
  return map[s] ?? "text-muted-foreground";
}

export function StatusDot({ s }: { s: JobStatus }) {
  const pulse = ["running", "uploading", "downloading"].includes(s);
  return (
    <span className="relative flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${pulse ? "animate-pulse bg-warning" : s === "ready" || s === "deployed" ? "bg-success" : s === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
    </span>
  );
}

export function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export const qualityInfo = {
  draft:      { label: "DRAFT",      samples: "5,000",  steps: "30k" },
  standard:   { label: "STANDARD",   samples: "10,000", steps: "50k" },
  production: { label: "PRODUCTION", samples: "25,000", steps: "100k" },
};
