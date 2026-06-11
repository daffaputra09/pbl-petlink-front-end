"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConversationItem from "@/components/chat/ConversationItem";
import DoctorDirectoryItem from "@/components/chat/DoctorDirectoryItem";
import DoctorChatPickerModal from "@/components/chat/DoctorChatPickerModal";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { TabType } from "@/types/chat";
import { useClinicChat } from "@/hooks/use-clinic-chat";
import { useClinicDoctors } from "@/hooks/use-clinic-doctors";
import { mergeDoctorDirectory } from "@/lib/chat/clinic-doctor-chat";
import { buildPesanUrl, parsePesanParams } from "@/lib/chat/pesan-url";
import { ProfileImageTooLargeError } from "@/lib/media/profile-image";
import { notifyError } from "@/lib/ui/notify";
import { useChatNotifications } from "@/lib/notifications/chat-notification-context";

function PesanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { threadId: selectedThreadId, tab: activeTab } = parsePesanParams(
    searchParams
  );

  const { setActiveThreadId } = useChatNotifications();
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [resolvingThread, setResolvingThread] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastResolvedThreadRef = useRef<string | null>(null);

  const { doctors, loading: doctorsLoading } = useClinicDoctors();
  const {
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
    sendMessage,
    sendImages,
    startChatWithDoctor,
    ensureThreadLoaded,
  } = useClinicChat(activeTab, selectedThreadId);

  const navigatePesan = useCallback(
    (options?: { threadId?: string | null; tab?: TabType }) => {
      router.replace(
        buildPesanUrl({
          tab: options?.tab ?? activeTab,
          threadId: options?.threadId ?? null,
        })
      );
    },
    [router, activeTab]
  );

  const selectThread = useCallback(
    (threadId: string, tab: TabType = activeTab) => {
      navigatePesan({ threadId, tab });
    },
    [navigatePesan, activeTab]
  );

  const customerList = conversations.Customers;
  const doctorThreads = conversations.Doctors;

  const doctorDirectory = useMemo(
    () => mergeDoctorDirectory(doctors, doctorThreads),
    [doctors, doctorThreads]
  );

  const filteredCustomers = customerList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDoctors = doctorDirectory.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCustomer = customerList.find((c) => c.id === selectedThreadId);
  const selectedDoctor = doctorDirectory.find(
    (d) => d.threadId === selectedThreadId
  );
  const selectedHeaderName =
    activeTab === "Customers"
      ? selectedCustomer?.name
      : selectedDoctor?.name ?? selectedCustomer?.name;
  const selectedSubtitle =
    activeTab === "Doctors" && selectedDoctor?.specialization
      ? selectedDoctor.specialization
      : undefined;

  useEffect(() => {
    setActiveThreadId(selectedThreadId);
    return () => setActiveThreadId(null);
  }, [selectedThreadId, setActiveThreadId]);

  useEffect(() => {
    if (!selectedThreadId) {
      lastResolvedThreadRef.current = null;
      return;
    }
    if (lastResolvedThreadRef.current === selectedThreadId) return;

    let cancelled = false;
    setResolvingThread(true);

    void ensureThreadLoaded(selectedThreadId).then((conv) => {
      if (cancelled) return;
      lastResolvedThreadRef.current = selectedThreadId;

      if (!conv) {
        navigatePesan({ tab: activeTab, threadId: null });
        return;
      }

      const correctTab: TabType =
        conv.peerRole === "doctor" ? "Doctors" : "Customers";
      if (correctTab !== activeTab) {
        navigatePesan({ threadId: selectedThreadId, tab: correctTab });
      }
    }).finally(() => {
      if (!cancelled) setResolvingThread(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    selectedThreadId,
    activeTab,
    ensureThreadLoaded,
    navigatePesan,
  ]);

  const handleListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading || loadingMoreThreads || !hasMoreThreads[activeTab]) {
      return;
    }
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
    navigatePesan({ tab, threadId: null });
  };

  const handleDoctorSelect = async (doctorId: string) => {
    const existing = doctorDirectory.find((d) => d.doctorId === doctorId);
    if (existing?.threadId) {
      selectThread(existing.threadId, "Doctors");
      return;
    }

    setStartingChat(true);
    try {
      const threadId = await startChatWithDoctor(doctorId);
      selectThread(threadId, "Doctors");
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : "Gagal memulai chat dengan dokter."
      );
    } finally {
      setStartingChat(false);
    }
  };

  const handlePickerSelect = async (doctorId: string) => {
    setPickerOpen(false);
    await handleDoctorSelect(doctorId);
  };

  const handleSend = async (text: string, files?: File[]) => {
    if (!selectedThreadId) return;
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
      notifyError(message);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const listLoading =
    activeTab === "Doctors" ? loading || doctorsLoading : loading;

  const chatLoading = messagesLoading || startingChat || resolvingThread;

  return (
    <div className="flex h-[calc(100vh-56px)] bg-gray-50">
      <div className="w-80 border-r flex flex-col bg-white border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-gray-800">Pesan</h2>
            {activeTab === "Doctors" ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors"
                title="Mulai chat dengan dokter"
              >
                +
              </button>
            ) : null}
          </div>
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
            placeholder={
              activeTab === "Doctors" ? "Cari dokter..." : "Cari percakapan..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          {activeTab === "Doctors" ? (
            <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
              Semua dokter klinik ditampilkan. Tap dokter atau tombol + untuk
              memulai chat.
            </p>
          ) : null}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto">
          {listLoading && (
            <p className="p-4 text-sm text-gray-400">Memuat...</p>
          )}

          {!listLoading && activeTab === "Customers" && filteredCustomers.length === 0 && (
            <p className="p-4 text-sm text-gray-400">Belum ada percakapan</p>
          )}

          {!listLoading && activeTab === "Doctors" && filteredDoctors.length === 0 && (
            <p className="p-4 text-sm text-gray-400">
              {doctors.length === 0
                ? "Belum ada dokter di klinik ini."
                : "Tidak ada dokter yang cocok dengan pencarian."}
            </p>
          )}

          {activeTab === "Customers"
            ? filteredCustomers.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === selectedThreadId}
                  onClick={() => selectThread(conv.id, "Customers")}
                />
              ))
            : filteredDoctors.map((entry) => (
                <DoctorDirectoryItem
                  key={entry.doctorId}
                  entry={entry}
                  isActive={entry.threadId === selectedThreadId}
                  onClick={() => void handleDoctorSelect(entry.doctorId)}
                />
              ))}

          {loadingMoreThreads && (
            <p className="p-3 text-center text-xs text-gray-400">Memuat lagi...</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedThreadId ? (
          <>
            <div className="px-4 py-3 border-b flex items-center bg-white border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">
                  {selectedHeaderName ?? "Percakapan"}
                </p>
                {selectedSubtitle ? (
                  <p className="text-xs text-gray-500">{selectedSubtitle}</p>
                ) : null}
              </div>
            </div>
            <ChatWindow
              messages={messages}
              loading={chatLoading}
              loadingMore={loadingMoreMessages}
              hasMore={hasMoreMessages}
              onLoadOlder={loadOlderMessages}
            />
            <ChatInput
              onSend={handleSend}
              sending={sending}
              disabled={!selectedThreadId || startingChat || resolvingThread}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm px-8 text-center gap-2">
            <p>
              {activeTab === "Doctors"
                ? "Pilih dokter untuk memulai atau melanjutkan chat"
                : "Pilih percakapan pelanggan"}
            </p>
            {activeTab === "Doctors" && doctors.length > 0 ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                Mulai chat baru
              </button>
            ) : null}
          </div>
        )}
      </div>

      <DoctorChatPickerModal
        open={pickerOpen}
        doctors={doctors}
        loading={doctorsLoading}
        onClose={() => setPickerOpen(false)}
        onSelect={(doctorId) => void handlePickerSelect(doctorId)}
      />
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
