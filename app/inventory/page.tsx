"use client";

import { HealthStatsModule } from "@/app/features/health-stats";

export default function RobotInventoryPage() {
  return (
    <div className="max-w-7xl mx-auto w-full space-y-10 sm:space-y-12 lg:space-y-16 pb-20 sm:pb-28 lg:pb-32 pt-2 sm:pt-4 lg:pt-6">
      <div className="border-b border-border pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter uppercase text-foreground">
          Health Stats
        </h1>
        <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest break-words">
          SYS.CONFIG // Robot health monitoring and diagnostics
        </p>
      </div>

      <HealthStatsModule />
    </div>
  );
}