"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/admin/format";
import type { WithdrawRow } from "@/hooks/use-admin-withdrawals";

interface ApproveWithdrawDialogProps {
  item: WithdrawRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  onConfirm: (file: File) => Promise<void>;
}

export default function ApproveWithdrawDialog({
  item,
  open,
  onOpenChange,
  busy = false,
  onConfirm,
}: ApproveWithdrawDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function reset() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleFileChange(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  }

  async function handleSubmit() {
    if (!file) return;
    await onConfirm(file);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Konfirmasi & bukti transfer</DialogTitle>
        </DialogHeader>

        {item ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm">
            <p className="font-semibold text-gray-900">{item.clinic_name}</p>
            <p className="text-emerald-700 font-bold mt-1">
              {formatRupiah(Number(item.amount))}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {item.bank_name} — {item.account_number}
              <br />
              a.n {item.account_name}
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Unggah foto bukti transfer sebelum menyetujui permohonan.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] ?? null)
            }
          />

          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <div className="relative w-full h-52">
                <Image
                  src={previewUrl}
                  alt="Pratinjau bukti transfer"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white"
                aria-label="Hapus foto"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
            >
              <ImagePlus size={28} className="text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">
                Pilih foto bukti transfer
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, atau WebP · maks. 2 MB</span>
            </button>
          )}

          {!previewUrl ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => inputRef.current?.click()}
            >
              Pilih file
            </Button>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={busy}
          >
            Batal
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={!file || busy}
            onClick={() => void handleSubmit()}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" />
                Memproses...
              </>
            ) : (
              "Setujui penarikan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
