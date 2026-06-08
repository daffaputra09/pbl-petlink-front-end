"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useGlobalChatNotifications } from "@/hooks/use-global-chat-notifications";
import type { NotificationPermissionState } from "@/lib/notifications/browser-notifications";

type ChatNotificationContextValue = {
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  unreadCount: number;
  permission: NotificationPermissionState;
  enableNotifications: () => Promise<NotificationPermissionState>;
  refreshUnreadCount: () => Promise<void>;
};

const ChatNotificationContext = createContext<ChatNotificationContextValue | null>(
  null
);

export function ChatNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeThreadId, setActiveThreadIdState] = useState<string | null>(null);

  const setActiveThreadId = useCallback((id: string | null) => {
    setActiveThreadIdState(id);
  }, []);

  const { unreadCount, permission, enableNotifications, refreshUnreadCount } =
    useGlobalChatNotifications(activeThreadId);

  const value = useMemo(
    () => ({
      activeThreadId,
      setActiveThreadId,
      unreadCount,
      permission,
      enableNotifications,
      refreshUnreadCount,
    }),
    [
      activeThreadId,
      setActiveThreadId,
      unreadCount,
      permission,
      enableNotifications,
      refreshUnreadCount,
    ]
  );

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotifications() {
  const ctx = useContext(ChatNotificationContext);
  if (!ctx) {
    throw new Error(
      "useChatNotifications must be used within ChatNotificationProvider"
    );
  }
  return ctx;
}
