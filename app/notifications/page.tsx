"use client";

import React, { useEffect, useState } from "react";
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle } from "react-icons/fi";

/**
 * Notifications Page
 * 
 * This page displays system notifications, alerts, and updates to the user.
 * It is accessed via the notification bell in the top-right HeaderActions.
 * 
 * Future updates: Integrate with backend notification service to fetch real-time
 * alerts and notifications instead of placeholder data.
 */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    console.log("[NotificationsPage] Component mounted. Fetching notifications...");
    // Placeholder notifications
    const mockData = [
      { id: 1, type: "info", message: "System update v2.4.0 is now available.", date: "2 mins ago" },
      { id: 2, type: "success", message: "Vector DB indexing completed successfully.", date: "1 hour ago" },
      { id: 3, type: "warning", message: "API rate limit approaching for current billing cycle.", date: "2 hours ago" },
    ];
    setNotifications(mockData);
    console.log("[NotificationsPage] Successfully loaded mock notifications:", mockData);
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10 sm:space-y-12 lg:space-y-16 pb-20 sm:pb-28 lg:pb-32 pt-2 sm:pt-4 lg:pt-6">
      <div className="border-b border-border pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-foreground flex items-center gap-2.5 sm:gap-3">
          <FiBell className="text-primary" /> Notifications
        </h1>
        <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest break-words">
          SYS.NOTIFICATIONS // View recent system alerts and updates
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-10 sm:py-12">No new notifications.</div>
        ) : (
          notifications.map((notif, index) => (
            <div
              key={notif.id}
              className="p-3 sm:p-4 rounded-xl bg-card border border-border flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow"
            >
              <div className="p-2 shrink-0 bg-background rounded-lg shadow-sm border border-border">
                {notif.type === "info" && <FiInfo className="text-blue-500" />}
                {notif.type === "success" && <FiCheckCircle className="text-success" />}
                {notif.type === "warning" && <FiAlertCircle className="text-warning" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground break-words">{notif.message}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{notif.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
