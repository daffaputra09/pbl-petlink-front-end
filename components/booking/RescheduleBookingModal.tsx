"use client";

import { useState } from "react";
import { X, CalendarDays, Clock, AlertCircle } from "lucide-react";
import { Booking } from "@/types/booking";

interface RescheduleBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmit: (id: string, tanggal: string, jamMulai: string, jamSelesai: string) => void;
}

export default function RescheduleBookingModal({
  booking,
  onClose,
  onSubmit,
}: RescheduleBookingModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [tanggal, setTanggal] = useState<string>(booking.tanggal);
  const [jamMulai, setJamMulai] = useState<string>(booking.jamMulai);
  const [jamSelesai, setJamSelesai] = useState<string>(booking.jamSelesai);
  const [errors, setErrors] = useState<{ tanggal?: string; jam?: string }>({});

  const validate = (): boolean => {
    const newErrors: { tanggal?: string; jam?: string } = {};

    if (!tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi.";
    } else if (tanggal < today) {
      newErrors.tanggal = "Tanggal tidak boleh di masa lalu.";
    }

    if (!jamMulai || !jamSelesai) {
      newErrors.jam = "Jam mulai dan jam selesai wajib diisi.";
    } else if (jamMulai >= jamSelesai) {
      newErrors.jam = "Jam mulai harus lebih awal dari jam selesai.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(booking.id, tanggal, jamMulai, jamSelesai);
    onClose();
  };

  const formatTanggalDisplay = (dateStr: string) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    const bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
    ];
    return `${d} ${bulan[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CalendarDays size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Reschedule Booking</h2>
              <p className="text-xs text-gray-400">Ubah tanggal &amp; jam janji temu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info Pasien */}
        <div className="mx-6 mt-5 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Pasien</p>
          <p className="text-sm font-semibold text-gray-800">{booking.namaPasien}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Pemilik: {booking.namaPemilik} &middot; {booking.jenis} &middot; {booking.kategori}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarDays size={12} />
            <span>Jadwal saat ini:</span>
            <span className="font-medium text-gray-600">
              {formatTanggalDisplay(booking.tanggal)}, {booking.jamMulai}–{booking.jamSelesai}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Tanggal Baru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                min={today}
                value={tanggal}
                onChange={(e) => {
                  setTanggal(e.target.value);
                  setErrors((prev) => ({ ...prev, tanggal: undefined }));
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                  errors.tanggal
                    ? "border-red-300 bg-red-50 focus:border-red-400"
                    : "border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
                }`}
              />
            </div>
            {errors.tanggal && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={11} /> {errors.tanggal}
              </p>
            )}
          </div>

          {/* Jam Mulai & Selesai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jam <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Clock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="time"
                  value={jamMulai}
                  onChange={(e) => {
                    setJamMulai(e.target.value);
                    setErrors((prev) => ({ ...prev, jam: undefined }));
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                    errors.jam
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : "border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-400 shrink-0">hingga</span>
              <div className="relative flex-1">
                <Clock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => {
                    setJamSelesai(e.target.value);
                    setErrors((prev) => ({ ...prev, jam: undefined }));
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                    errors.jam
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : "border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
                  }`}
                />
              </div>
            </div>
            {errors.jam && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={11} /> {errors.jam}
              </p>
            )}
          </div>

          {/* Preview jadwal baru */}
          {tanggal && jamMulai && jamSelesai && !errors.tanggal && !errors.jam && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
              <span className="font-medium">Jadwal baru: </span>
              {formatTanggalDisplay(tanggal)}, {jamMulai}–{jamSelesai}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Simpan Jadwal
          </button>
        </div>
      </div>
    </div>
  );
}
