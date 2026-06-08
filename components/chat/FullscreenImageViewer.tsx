"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface FullscreenImageViewerProps {
  url: string;
  caption?: string;
  onClose: () => void;
}

export default function FullscreenImageViewer({
  url,
  caption,
  onClose,
}: FullscreenImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const trimmedCaption = caption?.trim() ?? "";
  const hasCaption = trimmedCaption.length > 0;

  const clampScale = (value: number) => Math.min(5, Math.max(0.5, value));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => clampScale(s + (e.deltaY < 0 ? 0.12 : -0.12)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
        aria-label="Tutup"
      >
        <X size={22} />
      </button>

      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setScale((s) => clampScale(s - 0.25))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          aria-label="Perkecil"
        >
          <ZoomOut size={20} />
        </button>
        <button
          type="button"
          onClick={() => setScale((s) => clampScale(s + 0.25))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          aria-label="Perbesar"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      <div
        className="relative flex-1 min-h-0 cursor-grab active:cursor-grabbing touch-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Foto chat"
          draggable={false}
          className="mx-auto h-full max-h-full w-full max-w-full select-none object-contain transition-transform duration-75"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {hasCaption && (
        <div className="shrink-0 border-t border-white/10 bg-black/90 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words">
            {trimmedCaption}
          </p>
        </div>
      )}
    </div>,
    document.body
  );
}
