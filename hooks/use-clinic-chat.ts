"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import {
  lastMessagePreview,
  uploadChatImage,
} from "@/lib/storage/chat-image";
import type { Conversation, Message, TabType } from "@/types/chat";
import { findOrCreateClinicDoctorThread } from "@/lib/chat/clinic-doctor-chat";
import { findOrCreateClinicCustomerThread } from "@/lib/chat/clinic-customer-chat";
import { formatConversationListTime } from "@/lib/chat/datetime";

const THREAD_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 30;

type ThreadRow = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  user_1_id: string;
  user_2_id: string;
  type?: string;
  is_active?: boolean;
};

type MessageRow = {
  id: string;
  thread_id: string;
  message: string | null;
  message_type?: string | null;
  attachment_url?: string | null;
  created_at: string;
  sender_id: string;
  is_read?: boolean;
};

type ProfileRow = {
  id: string;
  name: string;
  role: string;
  image_url?: string | null;
};

function formatTime(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatListTime(iso: string | null | undefined) {
  return formatConversationListTime(iso);
}

function sortConversations(list: Conversation[]) {
  return [...list].sort((a, b) => {
    const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bt - at;
  });
}

function emptyTabState() {
  return { Customers: [] as Conversation[], Doctors: [] as Conversation[] };
}

function emptyTabFlags() {
  return { Customers: true, Doctors: true };
}

async function fetchUnreadCounts(
  supabase: ReturnType<typeof createClient>,
  threadIds: string[],
  userId: string
) {
  const counts: Record<string, number> = {};
  if (threadIds.length === 0) return counts;

  const { data } = await supabase
    .from("chat_messages")
    .select("thread_id")
    .in("thread_id", threadIds)
    .eq("is_read", false)
    .neq("sender_id", userId);

  for (const row of data ?? []) {
    const id = row.thread_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export function useClinicChat(activeTab: TabType, selectedThreadId: string | null) {
  const { profile } = useClinicSession();
  const selectedIdRef = useRef<string | null>(selectedThreadId);

  const [conversations, setConversations] = useState(emptyTabState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreThreads, setLoadingMoreThreads] = useState(false);
  const [hasMoreThreads, setHasMoreThreads] = useState(emptyTabFlags);
  const [threadPage, setThreadPage] = useState({ Customers: 0, Doctors: 0 });

  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagesPage, setMessagesPage] = useState(0);

  useEffect(() => {
    selectedIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  const selectedId = selectedThreadId;

  const buildConversation = useCallback(
    (
      thread: ThreadRow & {
        user1?: ProfileRow | ProfileRow[];
        user2?: ProfileRow | ProfileRow[];
      },
      unreadCount = 0
    ): Conversation | null => {
      if (!profile) return null;
      const u1 = Array.isArray(thread.user1) ? thread.user1[0] : thread.user1;
      const u2 = Array.isArray(thread.user2) ? thread.user2[0] : thread.user2;
      const peer = u1?.id === profile.id ? u2 : u1;
      if (!peer) return null;

      return {
        id: thread.id,
        name: peer.name,
        avatar: peer.image_url ?? undefined,
        initials: peer.name
          .split(" ")
          .slice(0, 2)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase(),
        lastMessage: thread.last_message ?? "",
        time: formatListTime(thread.last_message_at),
        lastMessageAt: thread.last_message_at,
        unreadCount,
        peerId: peer.id,
        peerRole: peer.role,
        threadType: thread.type,
        messages: [],
      };
    },
    [profile]
  );

  const mapMessageRow = useCallback(
    (row: MessageRow): Message => {
      const isImage = row.message_type === "image";
      return {
        id: row.id,
        content: row.message ?? "",
        time: formatTime(row.created_at),
        createdAt: row.created_at,
        isSent: row.sender_id === profile?.id,
        isRead: row.is_read ?? false,
        type: isImage ? "image" : "text",
        imageUrl: isImage ? (row.attachment_url ?? undefined) : undefined,
      };
    },
    [profile]
  );

  const fetchThreadsPage = useCallback(
    async (tab: TabType, page: number, replace: boolean) => {
      if (!profile) return;
      const supabase = createClient();
      const peerRole = tab === "Customers" ? "customer" : "doctor";
      const from = page * THREAD_PAGE_SIZE;
      const to = from + THREAD_PAGE_SIZE;

      const { data: threads } = await supabase
        .from("chat_threads")
        .select(
          `
          id, last_message, last_message_at, user_1_id, user_2_id, type,
          user1:profiles!chat_threads_user_1_id_fkey ( id, name, role, image_url ),
          user2:profiles!chat_threads_user_2_id_fkey ( id, name, role, image_url )
        `
        )
        .or(`user_1_id.eq.${profile.id},user_2_id.eq.${profile.id}`)
        .eq("is_active", true)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .range(from, to);

      const list = threads ?? [];
      const hasMore = list.length > THREAD_PAGE_SIZE;
      const slice = hasMore ? list.slice(0, THREAD_PAGE_SIZE) : list;

      const items: Conversation[] = [];
      for (const t of slice) {
        const conv = buildConversation(t as ThreadRow & typeof t);
        if (!conv || conv.peerRole !== peerRole) continue;
        if (tab === "Doctors" && conv.threadType !== "chat") continue;
        items.push(conv);
      }

      const unreadMap = await fetchUnreadCounts(
        supabase,
        items.map((c) => c.id),
        profile.id
      );

      const withUnread = items.map((c) => ({
        ...c,
        unreadCount: unreadMap[c.id] ?? 0,
      }));

      setConversations((prev) => {
        const merged = replace
          ? withUnread
          : sortConversations([
              ...prev[tab].filter(
                (existing) => !withUnread.some((n) => n.id === existing.id)
              ),
              ...withUnread,
            ]);
        return { ...prev, [tab]: merged };
      });
      setHasMoreThreads((prev) => ({ ...prev, [tab]: hasMore }));
      setThreadPage((prev) => ({ ...prev, [tab]: page }));
    },
    [profile, buildConversation]
  );

  const refreshThreads = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!profile) return;
      if (!options?.silent) setLoading(true);
      await fetchThreadsPage(activeTab, 0, true);
      setLoading(false);
    },
    [profile, activeTab, fetchThreadsPage]
  );

  const loadMoreThreads = useCallback(async () => {
    if (!profile || loadingMoreThreads || !hasMoreThreads[activeTab]) return;
    setLoadingMoreThreads(true);
    try {
      await fetchThreadsPage(activeTab, threadPage[activeTab] + 1, false);
    } finally {
      setLoadingMoreThreads(false);
    }
  }, [
    profile,
    activeTab,
    loadingMoreThreads,
    hasMoreThreads,
    threadPage,
    fetchThreadsPage,
  ]);

  const fetchAndInsertThread = useCallback(
    async (threadId: string): Promise<Conversation | null> => {
      if (!profile) return null;
      const supabase = createClient();
      const { data: thread } = await supabase
        .from("chat_threads")
        .select(
          `
          id, last_message, last_message_at, user_1_id, user_2_id, type, is_active,
          user1:profiles!chat_threads_user_1_id_fkey ( id, name, role, image_url ),
          user2:profiles!chat_threads_user_2_id_fkey ( id, name, role, image_url )
        `
        )
        .eq("id", threadId)
        .eq("is_active", true)
        .maybeSingle();

      if (!thread) return null;
      const unreadMap = await fetchUnreadCounts(supabase, [threadId], profile.id);
      const conv = buildConversation(
        thread as ThreadRow & typeof thread,
        unreadMap[threadId] ?? 0
      );
      if (!conv) return null;

      const bucket = conv.peerRole === "customer" ? "Customers" : "Doctors";
      setConversations((prev) => {
        const filtered = prev[bucket].filter((c) => c.id !== threadId);
        return {
          ...prev,
          [bucket]: sortConversations([conv, ...filtered]),
        };
      });
      return conv;
    },
    [profile, buildConversation]
  );

  const patchThread = useCallback(
    (threadId: string, patch: Partial<Conversation>) => {
      setConversations((prev) => {
        const touch = (list: Conversation[]) => {
          const idx = list.findIndex((c) => c.id === threadId);
          if (idx < 0) return list;
          const updated = { ...list[idx], ...patch };
          const next = list.filter((_, i) => i !== idx);
          return sortConversations([updated, ...next]);
        };
        return {
          Customers: touch(prev.Customers),
          Doctors: touch(prev.Doctors),
        };
      });
    },
    []
  );

  const removeThread = useCallback((threadId: string) => {
    setConversations((prev) => ({
      Customers: prev.Customers.filter((c) => c.id !== threadId),
      Doctors: prev.Doctors.filter((c) => c.id !== threadId),
    }));
  }, []);

  const markThreadAsRead = useCallback(
    async (threadId: string) => {
      if (!profile) return;
      const supabase = createClient();
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("thread_id", threadId)
        .neq("sender_id", profile.id)
        .eq("is_read", false);

      patchThread(threadId, { unreadCount: 0 });
    },
    [profile, patchThread]
  );

  const onThreadPayload = useCallback(
    (record: ThreadRow) => {
      if (!profile) return;
      if (record.user_1_id !== profile.id && record.user_2_id !== profile.id) {
        return;
      }
      if (record.is_active === false) {
        removeThread(record.id);
        return;
      }

      let found = false;
      setConversations((prev) => {
        found =
          prev.Customers.some((c) => c.id === record.id) ||
          prev.Doctors.some((c) => c.id === record.id);
        if (!found) return prev;

        const touch = (list: Conversation[]) => {
          const idx = list.findIndex((c) => c.id === record.id);
          if (idx < 0) return list;
          const updated = {
            ...list[idx],
            lastMessage: record.last_message ?? "",
            time: formatListTime(record.last_message_at),
            lastMessageAt: record.last_message_at,
          };
          const next = list.filter((_, i) => i !== idx);
          return sortConversations([updated, ...next]);
        };

        return {
          Customers: touch(prev.Customers),
          Doctors: touch(prev.Doctors),
        };
      });

      if (!found) void fetchAndInsertThread(record.id);
    },
    [profile, fetchAndInsertThread, removeThread]
  );

  const onMessagePayload = useCallback(
    (record: MessageRow, event: "INSERT" | "UPDATE") => {
      if (!profile) return;

      if (
        event === "UPDATE" &&
        selectedIdRef.current === record.thread_id &&
        record.sender_id === profile.id
      ) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === record.id ? { ...m, isRead: record.is_read ?? false } : m
          )
        );
      }

      let found = false;
      const fromPeer = record.sender_id !== profile.id;
      const isOpen = selectedIdRef.current === record.thread_id;

      setConversations((prev) => {
        found =
          prev.Customers.some((c) => c.id === record.thread_id) ||
          prev.Doctors.some((c) => c.id === record.thread_id);
        if (!found) return prev;

        const touch = (list: Conversation[]) => {
          const idx = list.findIndex((c) => c.id === record.thread_id);
          if (idx < 0) return list;

          const current = list[idx];
          const unreadDelta =
            event === "INSERT" && fromPeer && !isOpen ? 1 : 0;

          const updated = {
            ...current,
            lastMessage:
              event === "INSERT"
                ? lastMessagePreview(
                    (record as MessageRow).message_type,
                    record.message,
                    1
                  )
                : current.lastMessage,
            time:
              event === "INSERT"
                ? formatListTime(record.created_at)
                : current.time,
            lastMessageAt:
              event === "INSERT"
                ? record.created_at
                : current.lastMessageAt,
            unreadCount: isOpen
              ? 0
              : Math.max(0, (current.unreadCount ?? 0) + unreadDelta),
          };
          const next = list.filter((_, i) => i !== idx);
          return sortConversations([updated, ...next]);
        };

        return {
          Customers: touch(prev.Customers),
          Doctors: touch(prev.Doctors),
        };
      });

      if (event === "INSERT") {
        if (fromPeer && isOpen) void markThreadAsRead(record.thread_id);
        if (!found) void fetchAndInsertThread(record.thread_id);
      }
    },
    [profile, fetchAndInsertThread, mapMessageRow, markThreadAsRead]
  );

  const fetchMessagesPage = useCallback(
    async (threadId: string, page: number, replace: boolean) => {
      const supabase = createClient();
      const from = page * MESSAGE_PAGE_SIZE;
      const to = from + MESSAGE_PAGE_SIZE;

      const { data } = await supabase
        .from("chat_messages")
        .select(
          "id, message, message_type, attachment_url, created_at, sender_id, is_read"
        )
        .eq("thread_id", threadId)
        .order("created_at", { ascending: false })
        .range(from, to);

      const list = data ?? [];
      const hasMore = list.length > MESSAGE_PAGE_SIZE;
      const slice = hasMore ? list.slice(0, MESSAGE_PAGE_SIZE) : list;
      const items = slice.map((m) => mapMessageRow(m as MessageRow)).reverse();

      setMessages((prev) => (replace ? items : [...items, ...prev]));
      setHasMoreMessages(hasMore);
      setMessagesPage(page);
    },
    [mapMessageRow]
  );

  const loadMessagesFirstPage = useCallback(
    async (threadId: string) => {
      setMessagesLoading(true);
      setMessages([]);
      setMessagesPage(0);
      setHasMoreMessages(false);
      try {
        await fetchMessagesPage(threadId, 0, true);
        await markThreadAsRead(threadId);
      } finally {
        setMessagesLoading(false);
      }
    },
    [fetchMessagesPage, markThreadAsRead]
  );

  const loadOlderMessages = useCallback(async () => {
    if (!selectedId || !hasMoreMessages || loadingMoreMessages || messagesLoading) {
      return;
    }
    setLoadingMoreMessages(true);
    try {
      await fetchMessagesPage(selectedId, messagesPage + 1, false);
    } finally {
      setLoadingMoreMessages(false);
    }
  }, [
    selectedId,
    hasMoreMessages,
    loadingMoreMessages,
    messagesLoading,
    messagesPage,
    fetchMessagesPage,
  ]);

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    if (!profile) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`clinic-chat-list-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_threads" },
        (payload) => onThreadPayload(payload.new as ThreadRow)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_threads" },
        (payload) => onThreadPayload(payload.new as ThreadRow)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => onMessagePayload(payload.new as MessageRow, "INSERT")
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages" },
        (payload) => onMessagePayload(payload.new as MessageRow, "UPDATE")
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, onThreadPayload, onMessagePayload]);

  useEffect(() => {
    if (!selectedId || !profile) {
      setMessages([]);
      return;
    }

    void loadMessagesFirstPage(selectedId);

    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${selectedId}`,
        },
        (payload) => {
          const record = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === record.id)) return prev;
            return [...prev, mapMessageRow(record)];
          });
          if (record.sender_id !== profile.id) {
            void markThreadAsRead(selectedId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${selectedId}`,
        },
        (payload) => {
          const record = payload.new as MessageRow;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === record.id
                ? { ...m, isRead: record.is_read ?? false }
                : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, profile, loadMessagesFirstPage, mapMessageRow, markThreadAsRead]);

  const sendMessage = async (text: string) => {
    if (!selectedId || !profile) return;
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data: inserted } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: selectedId,
        sender_id: profile.id,
        message_type: "text",
        message: text,
      })
      .select("id, is_read")
      .single();

    await supabase
      .from("chat_threads")
      .update({
        last_message: text,
        last_message_at: now,
      })
      .eq("id", selectedId);

    if (inserted?.id) {
      setMessages((prev) => [
        ...prev,
        {
          id: inserted.id,
          content: text,
          time: formatTime(now),
          createdAt: now,
          isSent: true,
          isRead: inserted.is_read ?? false,
        },
      ]);
    }

    patchThread(selectedId, {
      lastMessage: text,
      time: formatListTime(now),
      lastMessageAt: now,
    });
  };

  const sendImages = async (files: File[], caption?: string) => {
    if (!selectedId || !profile || files.length === 0) return;

    const supabase = createClient();
    const now = new Date().toISOString();
    const trimmedCaption = caption?.trim() ?? "";
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const url = await uploadChatImage(
        profile.id,
        selectedId,
        files[i],
        i
      );
      urls.push(url);
    }

    const insertedRows: Message[] = [];

    for (let i = 0; i < urls.length; i++) {
      const { data: inserted, error } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: selectedId,
          sender_id: profile.id,
          message_type: "image",
          message:
            i === 0 && trimmedCaption.length > 0 ? trimmedCaption : null,
          attachment_url: urls[i],
        })
        .select("id, is_read")
        .single();

      if (error) throw error;

      insertedRows.push({
        id: inserted.id,
        content: i === 0 ? trimmedCaption : "",
        time: formatTime(now),
        createdAt: now,
        isSent: true,
        isRead: inserted.is_read ?? false,
        type: "image",
        imageUrl: urls[i],
      });
    }

    const preview = lastMessagePreview(
      "image",
      trimmedCaption || null,
      urls.length
    );

    await supabase
      .from("chat_threads")
      .update({
        last_message: preview,
        last_message_at: now,
      })
      .eq("id", selectedId);

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const fresh = insertedRows.filter((m) => !existingIds.has(m.id));
      return [...prev, ...fresh];
    });

    patchThread(selectedId, {
      lastMessage: preview,
      time: formatListTime(now),
      lastMessageAt: now,
    });
  };

  const startChatWithDoctor = useCallback(
    async (doctorId: string) => {
      if (!profile) throw new Error("Sesi klinik tidak valid.");
      const threadId = await findOrCreateClinicDoctorThread(profile.id, doctorId);
      await fetchAndInsertThread(threadId);
      return threadId;
    },
    [profile, fetchAndInsertThread]
  );

  const startChatWithCustomer = useCallback(
    async (customerId: string) => {
      if (!profile) throw new Error("Sesi klinik tidak valid.");
      const threadId = await findOrCreateClinicCustomerThread(
        profile.id,
        customerId
      );
      await fetchAndInsertThread(threadId);
      return threadId;
    },
    [profile, fetchAndInsertThread]
  );

  const ensureThreadLoaded = useCallback(
    async (threadId: string) => fetchAndInsertThread(threadId),
    [fetchAndInsertThread]
  );

  return {
    conversations,
    messages,
    loading,
    loadingMoreThreads,
    hasMoreThreads,
    loadMoreThreads,
    messagesLoading,
    loadingMoreMessages,
    hasMoreMessages,
    loadOlderMessages,
    refreshThreads,
    sendMessage,
    sendImages,
    startChatWithDoctor,
    startChatWithCustomer,
    ensureThreadLoaded,
  };
}