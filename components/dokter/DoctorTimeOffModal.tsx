"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DoctorScheduleEntry } from "@/types/dokter";

export interface DoctorTimeOffFormInput {
  allDay: boolean;
  startDate: string;
  endDate: string;
  startDateTime: string;
  endDateTime: string;
  notes: string;
}

interface DoctorTimeOffModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: DoctorTimeOffFormInput) => Promise<void>;
  editData?: DoctorScheduleEntry | null;
  saving?: boolean;
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function isLikelyAllDay(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startMidnight =
    start.getHours() === 0 && start.getMinutes() === 0;
  const durationMs = end.getTime() - start.getTime();
  const wholeDays = durationMs >= 23 * 60 * 60 * 1000;
  return startMidnight && wholeDays;
}

export default function DoctorTimeOffModal({
  open,
  onClose,
  onSave,
  editData,
  saving = false,
}: DoctorTimeOffModalProps) {
  const isEdit = !!editData;
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const allDayMode = isLikelyAllDay(editData.startsAt, editData.endsAt);
      setAllDay(allDayMode);
      setStartDate(toDateInput(editData.startsAt));
      const endInclusive = new Date(editData.endsAt);
      if (allDayMode) {
        endInclusive.setDate(endInclusive.getDate() - 1);
      }
      setEndDate(toDateInput(endInclusive.toISOString()));
      setStartDateTime(toDateTimeLocal(editData.startsAt));
      setEndDateTime(toDateTimeLocal(editData.endsAt));
      setNotes(
        editData.notes && editData.notes !== "Hari libur"
          ? editData.notes
          : ""
      );
    } else {
      const today = toDateInput(new Date().toISOString());
      setAllDay(true);
      setStartDate(today);
      setEndDate(today);
      setStartDateTime(`${today}T09:00`);
      setEndDateTime(`${today}T17:00`);
      setNotes("");
    }
    setErrors({});
  }, [open, editData]);

  if (!open) return null;

  function validate() {
    const e: Record<string, string> = {};
    if (allDay) {
      if (!startDate) e.startDate = "Tanggal mulai wajib diisi";
      if (!endDate) e.endDate = "Tanggal selesai wajib diisi";
      if (startDate && endDate && endDate < startDate) {
        e.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai";
      }
    } else {
      if (!startDateTime) e.startDateTime = "Waktu mulai wajib diisi";
      if (!endDateTime) e.endDateTime = "Waktu selesai wajib diisi";
      if (
        startDateTime &&
        endDateTime &&
        new Date(endDateTime) <= new Date(startDateTime)
      ) {
        e.endDateTime = "Waktu selesai harus setelah waktu mulai";
      }
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
      allDay,
      startDate,
      endDate,
      startDateTime,
      endDateTime,
      notes: notes.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">
              {isEdit ? "Edit Hari Libur" : "Tambah Hari Libur"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Dokter tidak dapat dibooking atau dikonsultasi pada rentang ini.
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

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAllDay(true)}
              className={`flex-1 py-2 text-sm rounded-lg border ${
                allDay
                  ? "bg-teal-50 border-teal-300 text-teal-800 font-medium"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Hari penuh
            </button>
            <button
              type="button"
              onClick={() => setAllDay(false)}
              className={`flex-1 py-2 text-sm rounded-lg border ${
                !allDay
                  ? "bg-teal-50 border-teal-300 text-teal-800 font-medium"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              Rentang waktu
            </button>
          </div>

          {allDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Dari tanggal *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                    errors.startDate ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Sampai tanggal *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                    errors.endDate ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Mulai *
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                    errors.startDateTime ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.startDateTime && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.startDateTime}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Selesai *
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                    errors.endDateTime ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.endDateTime && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.endDateTime}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Catatan (opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Cuti tahunan, seminar, dll."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            Disimpan ke <code>doctor_schedules</code> tanpa booking_id /
            consultation_id. Slot otomatis diblokir di sistem booking &
            konsultasi customer.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
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
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
