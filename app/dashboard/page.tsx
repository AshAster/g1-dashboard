"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FeatureStatusCard } from "./components/feature-status-card";
import { Database, Bot, Users, MapPin, Mic, Blocks, ShieldCheck, MessageSquare, Hand } from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";

export default function ClientDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for all real data
  const [agxStatus, setAgxStatus] = useState<"online" | "offline">("offline");
  const [robotStatus, setRobotStatus] = useState<"online" | "offline">("offline");
  
  const [ragStats, setRagStats] = useState<{ docs: number }>({ docs: 0 });
  const [personaStats, setPersonaStats] = useState<{ active: string, total: number }>({ active: "None", total: 0 });
  const [employeeCount, setEmployeeCount] = useState(0);
  const [mapCount, setMapCount] = useState(0);
  const [mcpCount, setMcpCount] = useState(0);
  const [auditCount, setAuditCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [gestureCount, setGestureCount] = useState(0);
  const [gesturesOffline, setGesturesOffline] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    // Animations
    const ctx = gsap.context(() => {
      gsap.from('.dash-header', { opacity: 0, y: -15, duration: 0.6, ease: 'power3.out' });
      gsap.from('.dash-widget', { opacity: 0, y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 });
    }, containerRef);

    // Helper for direct API calls
    const fetchApi = async (path: string) => {
      const token = api.getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`${API_BASE_URL}${path}`, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    };

    // Fetch real data in parallel
    const fetchData = async () => {
      // 1. AGX/Robot Health
      fetchApi("/gestures/health").then(() => {
        setAgxStatus("online");
        setRobotStatus("online");
      }).catch(() => {
        setAgxStatus("offline");
        setRobotStatus("offline");
      });

      // 2. RAG Stats
      api.getDashboardStats().then(res => {
        if (res.data) setRagStats({ docs: (res.data as any).totalDocuments || 0 });
      });

      // 3. Personas
      Promise.allSettled([
        api.getActivePersona(),
        api.getPersonas()
      ]).then(([activeRes, allRes]) => {
        const activeName = activeRes.status === 'fulfilled' && activeRes.value.data ? (activeRes.value.data as any).identity?.name : "None";
        const total = allRes.status === 'fulfilled' && allRes.value.data && Array.isArray(allRes.value.data) ? allRes.value.data.length : 0;
        setPersonaStats({ active: activeName || "None", total });
      });

      // 4. Employees
      fetchApi("/employees/").then(data => {
        if (Array.isArray(data)) setEmployeeCount(data.length);
      }).catch(() => {});

      // 5. Navigation Maps
      fetchApi("/navigation/locations").then(data => {
        if (Array.isArray(data)) setMapCount(data.length);
      }).catch(() => {});

      // 6. MCP
      api.getMcpIntegrations().then(res => {
        if (res.data && Array.isArray(res.data)) {
          const active = res.data.filter((m: any) => m.isEnabled).length;
          setMcpCount(active);
        }
      });

      // 7. Audit
      api.getAuditLogs().then(res => {
        if (res.data) setAuditCount((res.data as any).total || 0);
      });

      // 8. Chat
      fetchApi("/sessions/").then(data => {
        if (Array.isArray(data)) setChatCount(data.length);
      }).catch(() => {});

      // 9. Gestures
      fetchApi("/gestures/custom").then(data => {
        if (Array.isArray(data)) {
          setGestureCount(data.length);
        } else {
          setGesturesOffline(true);
        }
      }).catch(() => setGesturesOffline(true));
    };

    fetchData();
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto w-full pb-20 sm:pb-28 lg:pb-32 pt-2 sm:pt-4 lg:pt-6 flex flex-col gap-6 sm:gap-8">
      {/* Page Header */}
      <div className="dash-header flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            VEDA Control Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">{today} — Central Administration</p>
        </div>

        {/* Health Status Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 w-full lg:w-auto lg:min-w-[260px] shrink-0">
          <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-card border border-border shadow-sm">
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">AGX Health Status</span>
            <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold shrink-0 ${agxStatus === 'online' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${agxStatus === 'online' ? 'bg-success animate-pulse' : 'bg-destructive'}`}></span>
              {agxStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-card border border-border shadow-sm">
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">Robot Health Status</span>
            <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold shrink-0 ${robotStatus === 'online' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${robotStatus === 'online' ? 'bg-success animate-pulse' : 'bg-destructive'}`}></span>
              {robotStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
        </div>
      </div>

      {/* Modules Hub */}
      <section className="dash-widget mt-2 sm:mt-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">Preview panel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          
          <FeatureStatusCard
            title="Knowledge Base (RAG)"
            description="Upload internal documents to provide the robot with contextual business knowledge."
            icon={Database}
            statusText={`${ragStats.docs} Documents Indexed`}
            statusIndicator="success"
            manageLink="/rag"
            docsLink="/documentation#rag"
          />

          <FeatureStatusCard
            title="Persona Engine"
            description="Configure the robot's personality, tone of voice, and behavioral constraints."
            icon={Bot}
            statusText={`Active: ${personaStats.active}`}
            secondaryText={`${personaStats.total} Configured`}
            statusIndicator="neutral"
            manageLink="/persona"
            docsLink="/documentation#persona"
          />

          <FeatureStatusCard
            title="Facial Recognition (FRS)"
            description="Manage employee profiles and automated physical access tracking via facial data."
            icon={Users}
            statusText={`${employeeCount} Profiles Registered`}
            statusIndicator="success"
            manageLink="/employees"
            docsLink="/documentation#frs"
          />

          <FeatureStatusCard
            title="Navigation & Mapping"
            description="Manage saved location maps and send the robot to specific destinations."
            icon={MapPin}
            statusText={`${mapCount} Maps Saved`}
            statusIndicator="success"
            manageLink="/navigation"
            docsLink="/documentation#navigation"
          />

          <FeatureStatusCard
            title="Custom Wakewords"
            description="Train and assign custom voice triggers like 'Hey Veda' or 'Hey G1'."
            icon={Mic}
            statusText="Trigger: 'Hey Veda'"
            statusIndicator="neutral"
            manageLink="/wake-word"
            docsLink="/documentation#wakewords"
          />

          <FeatureStatusCard
            title="Integrations (MCP)"
            description="Connect to third-party APIs (Google Workspace, Jira) to give the robot external tools."
            icon={Blocks}
            statusText={`${mcpCount} Active Integrations`}
            statusIndicator={mcpCount > 0 ? "success" : "neutral"}
            manageLink="/mcp"
            docsLink="/documentation#integrations"
          />

          <FeatureStatusCard
            title="Audit Log"
            description="Track all admin actions, API calls, and configuration changes for compliance."
            icon={ShieldCheck}
            statusText={`${auditCount} Actions Logged`}
            statusIndicator="neutral"
            manageLink="/audit-logs"
            docsLink="/documentation#audit"
          />

          <FeatureStatusCard
            title="Chat Simulator"
            description="Preview and test how the robot responds using your current persona and knowledge base."
            icon={MessageSquare}
            statusText={`${chatCount} Conversations`}
            statusIndicator="neutral"
            manageLink="/chat"
            docsLink="/documentation#chat"
          />

          <FeatureStatusCard
            title="Gesture Library"
            description="Record and manage custom physical gestures for the robot to perform on demand."
            icon={Hand}
            statusText={gesturesOffline ? "AGX Required" : `${gestureCount} Custom Gestures`}
            statusIndicator={gesturesOffline ? "offline" : "success"}
            manageLink="/gestures"
            docsLink="/documentation#gestures"
          />

        </div>
      </section>

    </div>
  );
}
