"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConversationItem from "@/components/chat/ConversationItem";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { TabType } from "@/types/chat";
import { useClinicChat } from "@/hooks/use-clinic-chat";
import { ProfileImageTooLargeError } from "@/lib/media/profile-image";
import { useChatNotifications } from "@/lib/notifications/chat-notification-context";

function PesanPageContent() {
  const searchParams = useSearchParams();
  const { setActiveThreadId } = useChatNotifications();
  const [activeTab, setActiveTab] = useState<TabType>("Customers");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    selectedId,
    setSelectedId,
    loading,
    loadingMoreThreads,
    hasMoreThreads,
    loadMoreThreads,
    messagesLoading,
    loadingMoreMessages,
    hasMoreMessages,
    loadOlderMessages,
    sendMessage,
    sendImages,
  } = useClinicChat(activeTab);

  const currentList = conversations[activeTab];
  const filteredList = currentList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConversation = currentList.find((c) => c.id === selectedId);

  useEffect(() => {
    setActiveThreadId(selectedId);
    return () => setActiveThreadId(null);
  }, [selectedId, setActiveThreadId]);

  useEffect(() => {
    const threadId = searchParams.get("thread");
    if (threadId) {
      setSelectedId(threadId);
    }
  }, [searchParams, setSelectedId]);

  const handleListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading || loadingMoreThreads || !hasMoreThreads[activeTab]) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
      void loadMoreThreads();
    }
  }, [activeTab, hasMoreThreads, loadMoreThreads, loading, loadingMoreThreads]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleListScroll);
    return () => el.removeEventListener("scroll", handleListScroll);
  }, [handleListScroll]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const first = conversations[tab][0];
    setSelectedId(first?.id ?? null);
  };

  const handleSend = async (text: string, files?: File[]) => {
    if (!selectedId) return;
    setSending(true);
    try {
      if (files && files.length > 0) {
        await sendImages(files, text || undefined);
      } else if (text.trim()) {
        await sendMessage(text.trim());
      }
    } catch (err) {
      const message =
        err instanceof ProfileImageTooLargeError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Gagal mengirim pesan.";
      alert(message);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-gray-50">
      <div className="w-80 border-r flex flex-col bg-white border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Pesan</h2>
          <div className="flex gap-2 mt-3">
            {(["Customers", "Doctors"] as TabType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeTab === tab
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab === "Customers" ? "Pelanggan" : "Dokter"}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {loading && (
            <p className="p-4 text-sm text-gray-400">Memuat percakapan...</p>
          )}
          {!loading && filteredList.length === 0 && (
            <p className="p-4 text-sm text-gray-400">Belum ada percakapan</p>
          )}
          {filteredList.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === selectedId}
              onClick={() => setSelectedId(conv.id)}
            />
          ))}
          {loadingMoreThreads && (
            <p className="p-3 text-center text-xs text-gray-400">Memuat lagi...</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="px-4 py-3 border-b flex items-center bg-white border-gray-200">
              <p className="font-semibold text-gray-800">
                {selectedConversation.name}
              </p>
            </div>
            <ChatWindow
              messages={messages}
              loading={messagesLoading}
              loadingMore={loadingMoreMessages}
              hasMore={hasMoreMessages}
              onLoadOlder={loadOlderMessages}
            />
            <ChatInput
              onSend={handleSend}
              sending={sending}
              disabled={!selectedId}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Pilih percakapan
          </div>
        )}
      </div>
    </div>
  );
}

export default function PesanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-56px)] items-center justify-center text-sm text-gray-400">
          Memuat pesan...
        </div>
      }
    >
      <PesanPageContent />
    </Suspense>
  );
}
