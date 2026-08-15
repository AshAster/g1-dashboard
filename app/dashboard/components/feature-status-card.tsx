"use client";

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight, BookOpen } from "lucide-react";

interface FeatureStatusCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  statusText: string;
  statusIndicator: "success" | "warning" | "neutral" | "offline";
  manageLink: string;
  docsLink: string;
  secondaryText?: string;
}

export function FeatureStatusCard({
  title,
  description,
  icon: Icon,
  statusText,
  statusIndicator,
  manageLink,
  docsLink,
  secondaryText
}: FeatureStatusCardProps) {
  
  const statusColors = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    neutral: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    offline: "bg-muted text-muted-foreground border-border"
  };

  const dotColors = {
    success: "bg-success",
    warning: "bg-warning",
    neutral: "bg-blue-500",
    offline: "bg-muted-foreground"
  };

  return (
    <div className="group relative flex flex-col h-full rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] dark:shadow-[rgba(0,0,0,0.5)_0px_6px_12px_-2px,rgba(0,0,0,0.8)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.09)_0px_2px_1px,rgba(0,0,0,0.09)_0px_4px_2px,rgba(0,0,0,0.09)_0px_8px_4px,rgba(0,0,0,0.09)_0px_16px_8px,rgba(0,0,0,0.09)_0px_32px_16px] dark:hover:shadow-[rgba(255,255,255,0.05)_0px_2px_1px,rgba(255,255,255,0.05)_0px_4px_2px,rgba(255,255,255,0.05)_0px_8px_4px,rgba(255,255,255,0.05)_0px_16px_8px,rgba(255,255,255,0.05)_0px_32px_16px] hover:ring-1 hover:ring-primary hover:border-primary">
      
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-border bg-background/30 flex items-start justify-between relative z-0">
        <div className="flex items-start gap-3 relative min-w-0">
          <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl transition-all duration-300 mt-0.5 border border-transparent group-hover:bg-primary/20 shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">{title}</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed pr-1 sm:pr-2">{description}</p>
          </div>
        </div>
      </div>

      {/* Status Area */}
      <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col justify-center">
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2.5 sm:mb-3">Live Status Preview</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 w-fit px-2.5 sm:px-3 py-1.5 rounded-lg border shadow-sm ${statusColors[statusIndicator]}`}>
            {statusIndicator === 'success' && <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-success"></span>}
            {statusIndicator !== 'success' && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[statusIndicator]}`}></span>}
            <span className="text-xs sm:text-sm font-semibold tracking-wide">{statusText}</span>
          </div>
          {secondaryText && (
            <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg border border-border bg-muted/50">
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-muted-foreground">{secondaryText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 sm:p-4 bg-muted/30 border-t border-border flex items-center justify-between gap-2 relative overflow-hidden">
        <Link 
          href={docsLink}
          className="relative z-10 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-300 px-2 py-1.5 rounded-md hover:bg-background border border-transparent hover:border-border hover:shadow-sm shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Documentation
        </Link>

        <Link 
          href={manageLink}
          className="relative z-10 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary transition-all duration-300 px-2.5 sm:px-3 py-1.5 rounded-md border border-transparent group-hover:bg-primary/10 hover:!bg-primary/20 shrink-0 whitespace-nowrap"
        >
          Manage Module
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:translate-x-1.5 transition-transform duration-300" />
        </Link>
      </div>

    </div>
  );
}
