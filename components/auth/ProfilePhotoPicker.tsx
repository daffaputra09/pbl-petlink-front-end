"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  compressIfNeeded,
  getCroppedImageBlob,
  ProfileImageTooLargeError,
  readFileAsDataUrl,
} from "@/lib/media/profile-image";

export function ProfilePhotoPicker({
  previewUrl,
  onChange,
  onClear,
}: {
  previewUrl: string | null;
  onChange: (file: File, preview: string) => void;
  onClear: () => void;
}) {
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_: Area, area: Area) => {
    setCroppedArea(area);
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Pilih file gambar (JPG, PNG, atau WebP).");
      return;
    }
    setError("");
    const dataUrl = await readFileAsDataUrl(file);
    setImageSrc(dataUrl);
    setCropOpen(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }

  async function applyCrop() {
    if (!imageSrc || !croppedArea) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedArea);
      const file = await compressIfNeeded(blob);
      const preview = await readFileAsDataUrl(file);
      onChange(file, preview);
      setCropOpen(false);
      setImageSrc(null);
    } catch (err) {
      if (err instanceof ProfileImageTooLargeError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "Gagal memproses foto."
        );
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        Foto klinik <span className="text-gray-400 font-normal">(opsional)</span>
      </label>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-gray-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
            Pilih foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          {previewUrl && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-red-600 text-left"
            >
              Hapus foto
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Foto akan dipotong persegi dan dikompresi jika lebih dari 2 MB.
      </p>
      {error && (
        <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Potong Foto</DialogTitle>
          </DialogHeader>
          <div className="relative h-[280px] bg-gray-900 rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCropOpen(false)}
            >
              <X size={16} className="mr-1" />
              Batal
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={applyCrop}
              disabled={processing}
            >
              {processing && <Loader2 size={16} className="animate-spin mr-2" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
