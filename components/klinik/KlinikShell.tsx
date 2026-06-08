"use client";

import { useEffect } from "react";
import KlinikSidebar from "@/components/layout/KlinikSidebar";
import Header from "@/components/layout/Header";
import { ChatNotificationProvider, useChatNotifications } from "@/lib/notifications/chat-notification-context";

function NotificationPermissionPrompt() {
  const { permission, enableNotifications } = useChatNotifications();

  useEffect(() => {
    if (permission !== "default") return;
    const timer = window.setTimeout(() => {
      void enableNotifications();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [permission, enableNotifications]);

  return null;
}

export default function KlinikShell({ children }: { children: React.ReactNode }) {
  return (
    <ChatNotificationProvider>
      <NotificationPermissionPrompt />
      <div className="flex min-h-screen items-start bg-gray-50">
        <KlinikSidebar />
        <main className="min-h-screen min-w-0 flex-1">
          <Header />
          {children}
        </main>
      </div>
    </ChatNotificationProvider>
  );
}
