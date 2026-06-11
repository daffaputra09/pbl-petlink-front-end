"use client";

import { useState } from "react";
import { ExternalLink, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TransferProofViewerProps {
  url: string;
  label?: string;
  compact?: boolean;
}

export default function TransferProofViewer({
  url,
  label = "Bukti transfer",
  compact = false,
}: TransferProofViewerProps) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6B4F] hover:underline"
        >
          <ImageIcon size={13} />
          Lihat bukti
        </button>
        <ProofDialog open={open} onOpenChange={setOpen} url={url} label={label} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-2 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors text-left"
      >
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800">{label}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Klik untuk perbesar</p>
        </div>
      </button>
      <ProofDialog open={open} onOpenChange={setOpen} url={url} label={label} />
    </>
  );
}

function ProofDialog({
  open,
  onOpenChange,
  url,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  label: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full min-h-[240px] max-h-[70vh] rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="w-full h-full object-contain max-h-[70vh]"
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} className="mr-1.5" />
              Buka di tab baru
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
