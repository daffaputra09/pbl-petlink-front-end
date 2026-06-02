"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import type { Conversation, Message } from "@/types/chat";

export function useClinicChat() {
  const { profile } = useClinicSession();
  const [conversations, setConversations] = useState<{
    Customers: Conversation[];
    Doctors: Conversation[];
  }>({ Customers: [], Doctors: [] });
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshThreads = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();
    const { data: threads } = await supabase
      .from("chat_threads")
      .select(
        `
        id, last_message, last_message_at, user_1_id, user_2_id,
        user1:profiles!chat_threads_user_1_id_fkey ( id, name, role, image_url ),
        user2:profiles!chat_threads_user_2_id_fkey ( id, name, role, image_url )
      `
      )
      .or(`user_1_id.eq.${profile.id},user_2_id.eq.${profile.id}`)
      .eq("is_active", true)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    const customers: Conversation[] = [];
    const doctors: Conversation[] = [];

    for (const t of threads ?? []) {
      const u1 = Array.isArray(t.user1) ? t.user1[0] : t.user1;
      const u2 = Array.isArray(t.user2) ? t.user2[0] : t.user2;
      const peer =
        u1?.id === profile.id ? u2 : u1;
      if (!peer) continue;

      const conv: Conversation = {
        id: t.id,
        name: peer.name,
        avatar: peer.image_url ?? undefined,
        initials: peer.name
          .split(" ")
          .slice(0, 2)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase(),
        lastMessage: t.last_message ?? "",
        time: t.last_message_at
          ? new Date(t.last_message_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        messages: [],
      };

      if (peer.role === "customer") customers.push(conv);
      else if (peer.role === "doctor") doctors.push(conv);
    }

    setConversations({ Customers: customers, Doctors: doctors });
    setLoading(false);
  }, [profile]);

  const loadMessages = useCallback(
    async (threadId: string) => {
      const supabase = createClient();
      const { data } = await supabase
        .from("chat_messages")
        .select("id, message, created_at, sender_id")
        .eq("thread_id", threadId)
        .order("created_at");

      setMessages(
        (data ?? []).map((m) => ({
          id: m.id,
          content: m.message ?? "",
          time: new Date(m.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: m.sender_id === profile?.id,
        }))
      );
    },
    [profile]
  );

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    if (!selectedId || !profile) return;
    loadMessages(selectedId);
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
        () => loadMessages(selectedId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, profile, loadMessages]);

  const sendMessage = async (text: string) => {
    if (!selectedId || !profile) return;
    const supabase = createClient();
    await supabase.from("chat_messages").insert({
      thread_id: selectedId,
      sender_id: profile.id,
      message_type: "text",
      message: text,
    });
    await supabase
      .from("chat_threads")
      .update({
        last_message: text,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", selectedId);
    await loadMessages(selectedId);
    await refreshThreads();
  };

  return {
    conversations,
    messages,
    selectedId,
    setSelectedId,
    loading,
    refreshThreads,
    sendMessage,
  };
}
