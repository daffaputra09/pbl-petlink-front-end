"use client";

import { useEffect, useRef } from "react";
import { X, RefreshCw, MapPin, Mail, Phone, User } from "lucide-react";
import { Booking, BookingStatus } from "@/types/booking";

type Props = {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
};

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  Terjadwal: {
    label: "Terjadwal",
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  Selesai: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
  Dibatalkan: {
    label: "Dibatalkan",
    className: "bg-red-50 text-red-500 border border-red-200",
  },
};

export default function DetailBookingModal({
  booking,
  onClose,
  onUpdateStatus,
  onReschedule,
  onCancel,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { label, className } = statusConfig[booking.status];

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 text-center">
            Detail Booking
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Kategori Badge */}
          <div>
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {booking.kategori}
            </span>
          </div>

          {/* Nama & Jenis */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{booking.namaPasien}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{booking.jenis}</p>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
                Berat
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {booking.beratKg} kg
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
                Jenis Kelamin
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {booking.jenisKelamin}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
                Umur
              </p>
              <p className="text-sm font-semibold text-gray-800">{booking.usia}</p>
            </div>
          </div>

          {/* Jadwal */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
                Jadwal
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {booking.jamMulai} – {booking.jamSelesai}
              </p>
              <p className="text-xs text-gray-500">{booking.tanggal}</p>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-md whitespace-nowrap ${className}`}
            >
              {label}
            </span>
          </div>

          {/* Informasi Pemilik */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User size={15} className="text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Informasi Pemilik
              </p>
            </div>

            <div className="border border-gray-100 rounded-xl px-4 py-3 space-y-2.5">
              <p className="text-sm font-semibold text-gray-800">
                {booking.namaPemilik}
              </p>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{booking.alamatPemilik}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={13} className="shrink-0 text-gray-400" />
                <span>{booking.emailPemilik}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone size={13} className="shrink-0 text-gray-400" />
                <span>{booking.telpPemilik}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-3 space-y-3">
          {/* Update Status - only when Terjadwal */}
          {booking.status === "Terjadwal" && (
            <button
              onClick={() => onUpdateStatus(booking.id, "Selesai")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw size={15} />
              Update Status
            </button>
          )}

          {/* Reschedule & Cancel row */}
          {booking.status === "Terjadwal" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onReschedule(booking.id)}
                className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reschedule
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                className="py-3 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* If already done or cancelled - just close */}
          {booking.status !== "Terjadwal" && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
