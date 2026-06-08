"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { MAX_CHAT_IMAGES_PER_SEND } from "@/lib/storage/chat-image";

interface ChatInputProps {
  onSend: (text: string, files?: File[]) => void | Promise<void>;
  sending?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  sending = false,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = pendingFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingFiles]);

  const canSend =
    !disabled && !sending && (value.trim().length > 0 || pendingFiles.length > 0);

  const handleSend = async () => {
    if (!canSend) return;
    const text = value.trim();
    const files = pendingFiles.length > 0 ? [...pendingFiles] : undefined;
    try {
      await Promise.resolve(onSend(text, files));
      setValue("");
      setPendingFiles([]);
    } catch {
      // state retained on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    setPendingFiles((prev) => {
      const remaining = MAX_CHAT_IMAGES_PER_SEND - prev.length;
      if (remaining <= 0) return prev;
      return [...prev, ...selected.slice(0, remaining)];
    });
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100">
      {pendingFiles.length > 0 && (
        <div className="px-6 pt-3 pb-1 border-b border-gray-50">
          <p className="text-xs text-gray-500 mb-2 font-medium">
            {pendingFiles.length}/{MAX_CHAT_IMAGES_PER_SEND} foto dipilih
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previewUrls.map((url, index) => (
              <div key={url} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Pratinjau ${index + 1}`}
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-900"
                  aria-label="Hapus foto"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handlePickFiles}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending || pendingFiles.length >= MAX_CHAT_IMAGES_PER_SEND}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Lampirkan foto"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            placeholder={
              pendingFiles.length > 0
                ? "Tambahkan keterangan (opsional)..."
                : "Ketik pesan..."
            }
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1E6B4F]/30 transition disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="w-11 h-11 rounded-full bg-[#1E6B4F] flex items-center justify-center text-white hover:bg-[#165a3f] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
