"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { FiLifeBuoy, FiPlus, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import { FeatureGate } from "@/app/components/feature-gate";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
};

type TenantProfile = {
  id?: string;
  name?: string;
  hostEmail?: string;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export function SupportTicketsModule() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);

  // Form State
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string; visible: boolean}>({ message: "", visible: false });

  // Store ref to previous tickets to detect status changes
  const prevTicketsRef = React.useRef<Ticket[]>([]);
  const lastSeqRef = useRef<number>(-1);

  const fetchTicketsOnly = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets", { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.tickets && Array.isArray(data.tickets)) {
        // Check if any status changed
        if (prevTicketsRef.current.length > 0) {
          const oldStatusMap = new Map(prevTicketsRef.current.map(t => [t.id, t.status]));

          for (const newTicket of data.tickets) {
            const oldStatus = oldStatusMap.get(newTicket.id);
            if (oldStatus && oldStatus !== newTicket.status) {
              showToast(`Ticket "${newTicket.subject}" status changed to ${newTicket.status}`);
            }
          }
        }

        prevTicketsRef.current = data.tickets;
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  }, []);

  const fetchProfileAndTickets = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/auth/me", {
        headers: getAuthHeaders()
      });

      if (profileRes.ok) {
        const profile = await profileRes.json();
        const normalizedProfile: TenantProfile = {
          id: profile.tenantId || profile.id || "tenant-default",
          name: profile.tenantName || profile.name || "Tenant Admin",
          hostEmail: profile.email || "admin@tenant.com"
        };
        setTenantProfile(normalizedProfile);
      }

      await fetchTicketsOnly();
    } catch (error) {
      console.error("Failed to load initial data", error);
    } finally {
      setLoading(false);
    }
  }, [fetchTicketsOnly]);

  useEffect(() => {
    fetchProfileAndTickets();

    // Simple interval-based polling using the monotonic counter from /api/events.
    // Each GET returns immediately — no hanging Promises to leak in Turbopack.
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/events", { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const newSeq = data.seq as number;

        if (lastSeqRef.current === -1) {
          lastSeqRef.current = newSeq;
          return;
        }

        if (newSeq !== lastSeqRef.current) {
          lastSeqRef.current = newSeq;
          fetchTicketsOnly();
        }
      } catch {
        // network blip — will retry on next interval
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchProfileAndTickets, fetchTicketsOnly]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantProfile) return alert("Tenant profile not loaded");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          tenantId: tenantProfile.id,
          name: tenantProfile.name || "Tenant Admin",
          email: tenantProfile.hostEmail || "admin@tenant.com",
          subject,
          description
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTickets([data.ticket, ...tickets]);
        setIsModalOpen(false);
        setSubject("");
        setDescription("");
      } else {
        alert("Failed to submit ticket");
      }
    } catch (error) {
      console.error("Submit error", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "UNDER REVIEW": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <FeatureGate featureKey="tickets">
      <div className="max-w-7xl mx-auto w-full space-y-10 sm:space-y-12 lg:space-y-16 pb-20 sm:pb-28 lg:pb-32 pt-2 sm:pt-4 lg:pt-6">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100vw-2rem)] max-w-sm sm:w-auto justify-center bg-primary text-primary-foreground px-5 sm:px-6 py-3 rounded-full shadow-lg text-sm font-medium flex items-center gap-2.5 sm:gap-3"
            >
              <FiLifeBuoy className="text-xl" />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 sm:gap-3">
              <FiLifeBuoy className="text-primary" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground mt-2">
              Need help? Report bugs or request assistance from the platform admin.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto shrink-0 min-h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-primary/90 transition-colors"
          >
            <FiPlus /> Raise a ticket
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-14 sm:py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4 bg-card rounded-2xl border border-border">
            <FiLifeBuoy className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium">No Tickets Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              You have not submitted any support requests. If you encounter an issue, feel free to open a new ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-card rounded-2xl border border-border p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold break-words">{ticket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                      <span>ID: {ticket.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`self-start shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words opacity-80">{ticket.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Ticket Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-ticket-title"
                className="bg-card w-full max-w-lg max-h-[88dvh] rounded-2xl border border-border shadow-2xl overflow-y-auto overscroll-contain"
              >
                <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-border bg-muted/30">
                  <h2 id="new-ticket-title" className="text-base sm:text-xl font-semibold">Create Support Ticket</h2>
                  <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="p-2.5 shrink-0 rounded-lg hover:bg-accent text-muted-foreground">
                    <FiX />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="subject">Subject</label>
                    <input id="subject"
                      type="text"
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Brief description of the issue"
                      className="w-full min-h-11 bg-background border border-input rounded-lg px-3.5 sm:px-4 py-2.5 text-base sm:text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="description">Description</label>
                    <textarea id="description"
                      required
                      rows={5}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Provide details about the bug or your request..."
                      className="w-full bg-background border border-input rounded-lg px-3.5 sm:px-4 py-2.5 text-base sm:text-sm outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 sm:pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="min-h-11 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="min-h-11 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : null}
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </FeatureGate>
  );
}
