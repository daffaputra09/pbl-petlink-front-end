"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { lastMessagePreview } from "@/lib/storage/chat-image";
import { buildPesanUrl } from "@/lib/chat/pesan-url";
import {
  claimMessageNotification,
  publishChatNotificationBus,
  subscribeChatNotificationBus,
  tabShouldPresentInAppToast,
  tabShouldPresentOsNotification,
} from "@/lib/notifications/chat-notification-bus";
import {
  getNotificationSupport,
  requestNotificationPermission,
  showChatBrowserNotification,
} from "@/lib/notifications/browser-notifications";
import type { TabType } from "@/types/chat";

type MessageRow = {
  id: string;
  thread_id: string;
  message: string | null;
  message_type?: string | null;
  sender_id: string;
};

async function fetchTotalUnread(userId: string) {
  const supabase = createClient();
  const { data: threads } = await supabase
    .from("chat_threads")
    .select("id")
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`);

  const threadIds = (threads ?? []).map((t) => t.id as string);
  if (threadIds.length === 0) return 0;

  const { count } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .in("thread_id", threadIds)
    .eq("is_read", false)
    .neq("sender_id", userId);

  return count ?? 0;
}

export function useGlobalChatNotifications(activeThreadId: string | null) {
  const { profile } = useClinicSession();
  const pathname = usePathname();
  const router = useRouter();
  const onChatPage = pathname?.startsWith("/klinik/pesan") ?? false;

  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported" | "default"
  >("default");
  const seenMessageIds = useRef(new Set<string>());
  const activeThreadRef = useRef(activeThreadId);
  const onChatPageRef = useRef(onChatPage);
  const permissionRef = useRef(permission);

  activeThreadRef.current = activeThreadId;
  onChatPageRef.current = onChatPage;
  permissionRef.current = permission;

  const navigateToThread = useCallback(
    (threadId: string, tab?: TabType) => {
      router.push(buildPesanUrl({ threadId, tab: tab ?? "Customers" }));
    },
    [router]
  );

  const refreshUnreadCount = useCallback(async () => {
    if (!profile) {
      setUnreadCount(0);
      return;
    }
    const count = await fetchTotalUnread(profile.id);
    setUnreadCount(count);
    publishChatNotificationBus({ type: "unread-sync", count });
  }, [profile]);

  const bumpUnreadAcrossTabs = useCallback((delta: number) => {
    publishChatNotificationBus({ type: "unread-delta", delta });
  }, []);

  const enableNotifications = useCallback(async () => {
    const next = await requestNotificationPermission();
    setPermission(next);
    return next;
  }, []);

  useEffect(() => {
    setPermission(getNotificationSupport());
  }, []);

  useEffect(() => {
    return subscribeChatNotificationBus((event) => {
      if (event.type === "unread-sync") {
        setUnreadCount(event.count);
      } else if (event.type === "unread-delta") {
        setUnreadCount((current) => Math.max(0, current + event.delta));
      }
    });
  }, []);

  const handleIncomingMessage = useCallback(
    async (record: MessageRow) => {
      if (!profile || record.sender_id === profile.id) return;
      if (seenMessageIds.current.has(record.id)) return;
      if (!claimMessageNotification(record.id)) return;

      seenMessageIds.current.add(record.id);
      if (seenMessageIds.current.size > 100) {
        const first = seenMessageIds.current.values().next().value;
        if (first) seenMessageIds.current.delete(first);
      }

      const supabase = createClient();
      const { data: thread } = await supabase
        .from("chat_threads")
        .select("id, user_1_id, user_2_id")
        .eq("id", record.thread_id)
        .maybeSingle();

      if (
        !thread ||
        (thread.user_1_id !== profile.id && thread.user_2_id !== profile.id)
      ) {
        return;
      }

      const peerId =
        thread.user_1_id === profile.id
          ? (thread.user_2_id as string)
          : (thread.user_1_id as string);
      const { data: peer } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", peerId)
        .maybeSingle();
      const chatTab: TabType =
        peer?.role === "doctor" ? "Doctors" : "Customers";

      const isOpenThread =
        onChatPageRef.current && activeThreadRef.current === record.thread_id;
      if (isOpenThread) return;

      const { data: sender } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", record.sender_id)
        .maybeSingle();

      const senderName =
        (sender?.name as string | undefined)?.trim() || "Pesan baru";
      const preview = lastMessagePreview(record.message_type, record.message);

      bumpUnreadAcrossTabs(1);

      if (
        tabShouldPresentOsNotification() &&
        permissionRef.current === "granted"
      ) {
        showChatBrowserNotification({
          title: senderName,
          body: preview,
          threadId: record.thread_id,
          tag: `chat-msg-${record.id}`,
          tab: chatTab,
        });
        return;
      }

      if (tabShouldPresentInAppToast()) {
        toast.message(senderName, {
          description: preview,
          action: {
            label: "Buka",
            onClick: () => navigateToThread(record.thread_id, chatTab),
          },
        });
      }
    },
    [profile, bumpUnreadAcrossTabs, navigateToThread]
  );

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (onChatPage) {
      void refreshUnreadCount();
    }
  }, [onChatPage, activeThreadId, refreshUnreadCount]);

  useEffect(() => {
    if (!profile) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`clinic-chat-notify-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          void handleIncomingMessage(payload.new as MessageRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, handleIncomingMessage]);

  return {
    unreadCount,
    permission,
    enableNotifications,
    refreshUnreadCount,
    navigateToThread,
  };
}
