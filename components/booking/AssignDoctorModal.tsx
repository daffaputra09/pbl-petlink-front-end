"use client";

import { useMemo, useState } from "react";
import { X, Stethoscope, AlertCircle, Loader2 } from "lucide-react";
import type { Booking } from "@/types/booking";
import { useClinicDoctors } from "@/hooks/use-clinic-doctors";

interface AssignDoctorModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmit: (bookingId: string, doctorId: string) => Promise<void>;
}

export default function AssignDoctorModal({
  booking,
  onClose,
  onSubmit,
}: AssignDoctorModalProps) {
  const { doctors, loading } = useClinicDoctors();
  const activeDoctors = useMemo(
    () => doctors.filter((d) => d.isActive),
    [doctors]
  );
  const [doctorId, setDoctorId] = useState(booking.doctorId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const unchanged = doctorId === (booking.doctorId ?? "");

  const handleSubmit = async () => {
    if (!doctorId) {
      setError("Pilih dokter yang menangani booking ini.");
      return;
    }
    if (unchanged) {
      setError("Pilih dokter yang berbeda dari penugasan saat ini.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(booking.id, doctorId);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui dokter");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Stethoscope size={16} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Ubah Dokter
              </h2>
              <p className="text-xs text-gray-400">
                {booking.namaPasien} · jadwal tetap sama
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-sm">
            <p className="text-xs text-gray-400 mb-1">Dokter saat ini</p>
            <p className="font-medium text-gray-800">
              {booking.namaDokter?.trim() || "Belum ditentukan"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dokter penanggung jawab <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 size={16} className="animate-spin" />
                Memuat daftar dokter...
              </div>
            ) : activeDoctors.length === 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Tidak ada dokter aktif. Aktifkan atau undang dokter terlebih
                dahulu.
              </p>
            ) : (
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 outline-none"
              >
                <option value="">— Pilih dokter —</option>
                {activeDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                    {d.spesialisasi ? ` · ${d.spesialisasi}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error ? (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={11} />
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || loading || activeDoctors.length === 0}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
