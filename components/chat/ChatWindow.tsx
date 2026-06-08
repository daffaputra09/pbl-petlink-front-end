"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { CheckCheck } from "lucide-react";
import FullscreenImageViewer from "@/components/chat/FullscreenImageViewer";

interface ChatWindowProps {
  messages: Message[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadOlder?: () => void;
}

function bubbleRadius(isSent: boolean) {
  return isSent
    ? "rounded-2xl rounded-br-sm"
    : "rounded-2xl rounded-bl-sm";
}

function MetaRow({
  time,
  isSent,
  isRead,
  onDark = false,
}: {
  time: string;
  isSent: boolean;
  isRead?: boolean;
  onDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span
        className={`text-[10px] ${
          onDark ? "text-white/75" : "text-gray-400"
        }`}
      >
        {time}
      </span>
      {isSent && (
        <CheckCheck
          size={12}
          className={
            isRead
              ? "text-sky-400"
              : onDark
                ? "text-white/50"
                : "text-gray-400"
          }
          aria-label={isRead ? "Sudah dibaca" : "Belum dibaca"}
        />
      )}
    </div>
  );
}

export default function ChatWindow({
  messages,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadOlder,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const shouldStickBottomRef = useRef(true);
  const [viewer, setViewer] = useState<{ url: string; caption?: string } | null>(
    null
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      shouldStickBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 80;

      if (el.scrollTop <= 80 && hasMore && !loadingMore && onLoadOlder) {
        onLoadOlder();
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, onLoadOlder]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const grewAtTop =
      messages.length > prevLengthRef.current &&
      prevLengthRef.current > 0 &&
      !shouldStickBottomRef.current;

    if (grewAtTop) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
    } else if (shouldStickBottomRef.current || prevLengthRef.current === 0) {
      el.scrollTop = el.scrollHeight;
    }

    prevLengthRef.current = messages.length;
    prevScrollHeightRef.current = el.scrollHeight;
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Memuat pesan...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Belum ada pesan</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 flex flex-col gap-3"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-gray-400">Memuat pesan lama...</span>
          </div>
        )}

        {messages.map((msg) => {
          const hasImage = Boolean(msg.imageUrl);
          const hasCaption = msg.content.trim().length > 0;
          const isSent = msg.isSent;
          const sentBg = "bg-[#1E6B4F] text-white";
          const recvBg = "bg-white text-gray-800 shadow-sm";

          return (
            <div
              key={msg.id}
              className={`flex ${isSent ? "justify-end" : "justify-start"}`}
            >
              {hasImage && hasCaption ? (
                <div
                  className={`max-w-[65%] overflow-hidden text-sm leading-relaxed ${bubbleRadius(isSent)} ${isSent ? sentBg : recvBg}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setViewer({
                        url: msg.imageUrl!,
                        caption: hasCaption ? msg.content : undefined,
                      })
                    }
                    className="block w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1E6B4F]/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.imageUrl}
                      alt="Foto chat"
                      className="max-h-52 w-full object-cover cursor-zoom-in hover:opacity-95 transition"
                    />
                  </button>
                  <div className="px-3.5 pt-2 pb-2">
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className="flex justify-end mt-1">
                      <MetaRow
                        time={msg.time}
                        isSent={isSent}
                        isRead={msg.isRead}
                        onDark={isSent}
                      />
                    </div>
                  </div>
                </div>
              ) : hasImage ? (
                <div
                  className={`relative max-w-[65%] overflow-hidden ${bubbleRadius(isSent)}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setViewer({
                        url: msg.imageUrl!,
                        caption: hasCaption ? msg.content : undefined,
                      })
                    }
                    className="block w-full focus:outline-none focus:ring-2 focus:ring-[#1E6B4F]/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.imageUrl}
                      alt="Foto chat"
                      className="max-h-52 w-full max-w-xs object-cover cursor-zoom-in hover:opacity-95 transition"
                    />
                  </button>
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/45 px-1.5 py-0.5">
                    <MetaRow
                      time={msg.time}
                      isSent={isSent}
                      isRead={msg.isRead}
                      onDark
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${bubbleRadius(isSent)} ${isSent ? sentBg : recvBg}`}
                >
                  <p>{msg.content}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isSent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <MetaRow
                      time={msg.time}
                      isSent={isSent}
                      isRead={msg.isRead}
                      onDark={isSent}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewer && (
        <FullscreenImageViewer
          url={viewer.url}
          caption={viewer.caption}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}