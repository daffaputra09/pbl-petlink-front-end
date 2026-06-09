"use client";

import { useEffect, useRef } from "react";
import {
  X,
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  User,
  Stethoscope,
  Wrench,
  CreditCard,
  FileText,
  Navigation,
  Home,
} from "lucide-react";
import { Booking, BookingStatus } from "@/types/booking";
import {
  displayStatusBadgeClass,
} from "@/lib/booking/display-status";
import { googleMapsDirectionsUrl } from "@/lib/booking/visit-address";

type Props = {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onReschedule: (id: string) => void;
  onCancel: (id: string) => void;
};

function formatTanggal(tanggal: string): string {
  const [y, m, d] = tanggal.split("-");
  if (d && m && y) return `${d}/${m}/${y}`;
  return tanggal;
}

export default function DetailBookingModal({
  booking,
  onClose,
  onUpdateStatus,
  onReschedule,
  onCancel,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const displayLabel = booking.displayLabel ?? booking.status;
  const badgeClass = displayStatusBadgeClass(
    booking.displayKind ?? "terjadwal"
  );
  const isHome = booking.channel === "home";
  const isClinic = booking.channel === "clinic" || !isHome;
  const canComplete =
    booking.status === "Terjadwal" &&
    (booking.rawStatus === "confirmed" ||
      booking.rawStatus === "in_progress" ||
      booking.rawStatus === "pending");
  const canRescheduleOrCancel =
    booking.status === "Terjadwal" &&
    booking.rawStatus !== "in_progress" &&
    booking.rawStatus !== "completed";

  const directionsUrl =
    isHome
      ? googleMapsDirectionsUrl({
          latitude: booking.visitLatitude,
          longitude: booking.visitLongitude,
          address: booking.visitAddress,
        })
      : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 text-center">
            Detail Booking
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {booking.kategori}
            </span>
            {isHome ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                <Home size={12} />
                Home Service
              </span>
            ) : (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                Kunjungan Klinik
              </span>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900">{booking.namaPasien}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{booking.jenis}</p>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">Berat</p>
              <p className="text-sm font-semibold text-gray-800">{booking.beratKg} kg</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">Jenis Kelamin</p>
              <p className="text-sm font-semibold text-gray-800">{booking.jenisKelamin}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">Umur</p>
              <p className="text-sm font-semibold text-gray-800">{booking.usia}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">Jadwal</p>
              <p className="text-sm font-semibold text-gray-800">
                {booking.jamMulai} – {booking.jamSelesai}
              </p>
              <p className="text-xs text-gray-500">{formatTanggal(booking.tanggal)}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-md whitespace-nowrap ${badgeClass}`}>
              {displayLabel}
            </span>
          </div>

          {isHome && booking.displayKind === "menungguCheckIn" && (
            <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 text-sm text-amber-800">
              Menunggu dokter check-in di lokasi customer. Status berlangsung dimulai setelah check-in GPS.
            </div>
          )}

          {isClinic && booking.displayKind === "berlangsung" && (
            <div className="bg-sky-50 rounded-xl px-4 py-3 border border-sky-100 text-sm text-sky-800">
              Kunjungan klinik: status berlangsung diperbarui otomatis saat jadwal dimulai.
            </div>
          )}

          {booking.checkedInAt && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100 text-sm text-emerald-800">
              Dokter sudah check-in di lokasi customer.
            </div>
          )}

          {booking.namaDokter && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <Stethoscope size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">Dokter</p>
                <p className="text-sm font-semibold text-gray-800">{booking.namaDokter}</p>
              </div>
            </div>
          )}

          {booking.namaLayanan && booking.namaLayanan.length > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Wrench size={14} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Layanan</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.namaLayanan.map((layanan, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {layanan}
                  </span>
                ))}
              </div>
            </div>
          )}

          {booking.totalAmount != null && booking.totalAmount > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <CreditCard size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">Total Biaya</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(booking.totalAmount)}
                </p>
              </div>
            </div>
          )}

          {booking.catatan && (
            <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-3 border border-amber-100">
              <FileText size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-amber-500 font-medium mb-0.5">Catatan</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{booking.catatan}</p>
              </div>
            </div>
          )}

          {isHome && booking.visitAddress && (
            <div className="bg-violet-50 rounded-xl px-4 py-3 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-violet-600 shrink-0" />
                <p className="text-[11px] uppercase tracking-wide text-violet-600 font-medium">
                  Alamat Kunjungan
                </p>
              </div>
              <p className="text-sm text-gray-700 mb-3">{booking.visitAddress}</p>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
                >
                  <Navigation size={14} />
                  Buka petunjuk arah
                </a>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <User size={15} className="text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Informasi Pemilik
              </p>
            </div>
            <div className="border border-gray-100 rounded-xl px-4 py-3 space-y-2.5">
              <p className="text-sm font-semibold text-gray-800">{booking.namaPemilik}</p>
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

        <div className="px-6 pb-6 pt-3 space-y-3">
          {canComplete && (
            <button
              onClick={() => onUpdateStatus(booking.id, "Selesai")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw size={15} />
              Tandai Selesai
            </button>
          )}

          {canRescheduleOrCancel && (
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

          {!canComplete && !canRescheduleOrCancel && (
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
