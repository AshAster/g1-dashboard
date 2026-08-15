"use client";

import React, { useState, useEffect, useRef } from "react";
import { FeatureGate } from "@/app/components/feature-gate";
import { FiShield, FiUserPlus, FiMoreVertical, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { api } from "@/lib/api";

gsap.registerPlugin(useGSAP);

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: number;
  created_at: string;
}

export function RbacModule() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor" | "user" | "viewer">("user");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await api.listUsers();
    if (!res.error) {
      setUsers((res.data as UserRecord[]) || []);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    
    const res = await api.createUser({ 
      username: newUsername, 
      email: newEmail, 
      password: newPassword, 
      role: newRole 
    });
    
    if (res.error) {
      setFormError(typeof res.error === "string" ? res.error : "Failed to create user");
    } else {
      setShowModal(false);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      loadUsers();
    }
    setSaving(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await api.deleteUser(id);
    loadUsers();
  };

  useGSAP(() => {
    if (users.length > 0) {
      gsap.fromTo(
        ".rbac-row",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, { dependencies: [users], scope: containerRef });

  return (
    <FeatureGate featureKey="rbac">
      <div ref={containerRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wide">Role-Based Access Control</h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">Manage user permissions and security roles.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider rounded shadow hover:opacity-90 transition-colors"
          >
            <FiUserPlus /> Invite User
          </button>
        </div>

        <div className="border border-border rounded-xl overflow-x-auto bg-card/30 relative shadow-inner">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <span className="text-sm font-mono text-muted-foreground animate-pulse bg-background/80 px-4 py-2 rounded-full shadow-lg border border-border">Loading team...</span>
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 border-b border-border bg-muted/50 text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider min-w-[560px]">
            <div className="col-span-2">User Profile</div>
            <div>Access Level</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/50 min-h-[100px] min-w-[560px]">
            {users.length === 0 && !loading && (
               <div className="p-8 text-center text-muted-foreground font-mono text-sm">No users found.</div>
            )}
            {users.map((u) => (
              <div key={u.id} className="rbac-row grid grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 items-center hover:bg-card/50 transition-colors min-w-[560px]">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{u.username}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{u.email}</div>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-bold tracking-wider font-mono px-2.5 py-1 rounded-full uppercase ${
                    u.role === "admin" ? "bg-destructive/10 text-destructive border border-destructive/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
                    u.role === "editor" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]" :
                    "bg-secondary text-secondary-foreground border border-border shadow-sm"
                  }`}>
                    {u.role}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all tooltip-trigger" title="Revoke Access">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overscroll-contain">
          <div role="dialog" aria-modal="true" aria-labelledby="invite-user-title" className="bg-card border border-border rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[88dvh] overflow-y-auto overscroll-contain shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded-full transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <h2 id="invite-user-title" className="text-xl font-bold mb-1 uppercase tracking-wide">Invite Team Member</h2>
            <p className="text-xs text-muted-foreground font-mono mb-6 pb-4 border-b border-border">Provision a new account and grant access.</p>
            
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-mono flex items-center gap-2">
                <FiShield /> {formError}
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground" htmlFor="username">Username</label>
                <input id="username" required value={newUsername} onChange={e => setNewUsername(e.target.value)}
                  className="w-full min-h-11 px-4 py-2.5 bg-background border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="johndoe" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground" htmlFor="email">Email</label>
                <input id="email" required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="w-full min-h-11 px-4 py-2.5 bg-background border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="john@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground" htmlFor="temporary-password">Temporary Password</label>
                <input id="temporary-password" required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full min-h-11 px-4 py-2.5 bg-background border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground" htmlFor="access-role">Access Role</label>
                <select id="access-role" value={newRole} onChange={e => setNewRole(e.target.value as any)}
                  className="w-full min-h-11 px-4 py-2.5 bg-background border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none">
                  <option value="admin">Admin - Full System Access</option>
                  <option value="editor">Editor - Read/Write Robots</option>
                  <option value="user">User - Chat Only</option>
                  <option value="viewer">Viewer - Read Only</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? "Provisioning..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </FeatureGate>
  );
}
