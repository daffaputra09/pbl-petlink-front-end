"use client";

import { useEffect, useState } from "react";
import DurationPicker from "@/components/layanan/DurationPicker";
import ServiceChannelPicker from "@/components/layanan/ServiceChannelPicker";
import { X } from "lucide-react";
import type { ClinicService, ServiceFormInput } from "@/types/layanan";

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: ServiceFormInput) => Promise<void>;
  editData?: ClinicService | null;
  saving?: boolean;
}

export default function ServiceFormModal({
  open,
  onClose,
  onSave,
  editData,
  saving = false,
}: ServiceFormModalProps) {
  const isEdit = !!editData;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isClinicService, setIsClinicService] = useState(true);
  const [isHomeService, setIsHomeService] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(editData?.name ?? "");
    setDescription(editData?.description ?? "");
    setPrice(editData ? String(editData.price) : "");
    setDurationMinutes(editData?.durationMinutes ?? 30);
    setIsClinicService(editData?.isClinicService ?? true);
    setIsHomeService(editData?.isHomeService ?? false);
    setIsActive(editData?.isActive ?? true);
    setErrors({});
  }, [open, editData]);

  if (!open) return null;

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama layanan wajib diisi";
    const priceNum = Number.parseFloat(price.replace(/\D/g, "") || "0");
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      e.price = "Harga harus lebih dari 0";
    }
    if (!durationMinutes || durationMinutes <= 0 || durationMinutes > 480) {
      e.durationMinutes = "Durasi harus antara 1–480 menit";
    }
    if (!isClinicService && !isHomeService) {
      e.channel = "Pilih minimal satu channel layanan";
    }
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number.parseFloat(price.replace(/\D/g, "") || "0"),
      durationMinutes,
      isClinicService,
      isHomeService,
      isActive,
    });
  }

  function formatPriceInput(val: string) {
    const num = val.replace(/\D/g, "");
    return num ? Number(num).toLocaleString("id-ID") : "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Layanan" : "Tambah Layanan"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Selaras dengan tabel services di Supabase
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Nama Layanan *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rawat Jalan Dokter Hewan"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                errors.name ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Opsional — penjelasan layanan untuk customer"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Harga (Rp) *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={price ? formatPriceInput(price) : ""}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                errors.price ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          <DurationPicker
            value={durationMinutes}
            onChange={setDurationMinutes}
            error={errors.durationMinutes}
          />

          <ServiceChannelPicker
            isClinicService={isClinicService}
            isHomeService={isHomeService}
            onChange={({ isClinicService: clinic, isHomeService: home }) => {
              setIsClinicService(clinic);
              setIsHomeService(home);
            }}
            error={errors.channel}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Status
            </label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
