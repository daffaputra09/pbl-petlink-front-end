"use client";

import type { Doctor } from "@/types/dokter";

interface DoctorChatPickerModalProps {
  open: boolean;
  doctors: Doctor[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (doctorId: string) => void;
}

export default function DoctorChatPickerModal({
  open,
  doctors,
  loading = false,
  onClose,
  onSelect,
}: DoctorChatPickerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Mulai Chat dengan Dokter</h3>
          <p className="text-sm text-gray-500 mt-1">
            Pilih dokter yang bekerja di klinik Anda.
          </p>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto">
          {loading ? (
            <p className="p-5 text-sm text-gray-400">Memuat daftar dokter...</p>
          ) : doctors.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">
              Belum ada dokter terdaftar. Tambahkan dokter di menu Dokter.
            </p>
          ) : (
            doctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => onSelect(doctor.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                {doctor.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctor.photo}
                    alt={doctor.nama}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    {doctor.nama
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{doctor.nama}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {doctor.spesialisasi}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
