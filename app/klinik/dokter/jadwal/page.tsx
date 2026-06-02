"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useClinicDoctors, useDoctorSchedules } from "@/hooks/use-clinic-doctors";

export default function JadwalDokterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const { doctors } = useClinicDoctors();
  const doctor = doctors.find((d) => d.id === doctorId);
  const { schedules, loading, saveBlock, remove } = useDoctorSchedules(doctorId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState("");
  const [jamMulai, setJamMulai] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("12:00");
  const [notes, setNotes] = useState("");

  const grouped = useMemo(() => {
    return schedules.map((s) => {
      const start = new Date(s.startsAt);
      return {
        ...s,
        tanggal: start.toLocaleDateString("id-ID"),
        jamMulai: start.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        jamSelesai: new Date(s.endsAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    });
  }, [schedules]);

  async function handleSave() {
    if (!tanggal) return alert("Tanggal wajib diisi.");
    const startsAt = new Date(`${tanggal}T${jamMulai}:00`).toISOString();
    const endsAt = new Date(`${tanggal}T${jamSelesai}:00`).toISOString();
    try {
      await saveBlock({
        id: editId ?? undefined,
        startsAt,
        endsAt,
        notes: notes || undefined,
      });
      setModalOpen(false);
      setEditId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/klinik/dokter")}
        className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-800"
      >
        <ChevronLeft size={16} />
        Kembali ke Dokter
      </button>

      <h1 className="text-xl font-bold text-gray-800">
        Jadwal — {doctor?.nama ?? "Dokter"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Blok waktu (sibuk) di kalender dokter
      </p>

      <button
        type="button"
        onClick={() => {
          setEditId(null);
          setModalOpen(true);
        }}
        className="mb-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
      >
        <Plus size={16} />
        Tambah blok jadwal
      </button>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat...</p>
      ) : (
        <div className="space-y-3">
          {grouped.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">{s.tanggal}</p>
                <p className="text-sm text-gray-500">
                  {s.jamMulai} — {s.jamSelesai}
                  {s.notes ? ` · ${s.notes}` : ""}
                  {s.bookingId ? " · Terhubung booking" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm text-emerald-600"
                  onClick={() => {
                    setEditId(s.id);
                    const d = new Date(s.startsAt);
                    setTanggal(d.toISOString().slice(0, 10));
                    setJamMulai(s.jamMulai);
                    setJamSelesai(s.jamSelesai);
                    setNotes(s.notes ?? "");
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                {!s.bookingId && (
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => remove(s.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <p className="text-sm text-gray-400">Belum ada jadwal.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h3 className="font-bold">
              {editId ? "Edit blok" : "Tambah blok jadwal"}
            </h3>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <input
              placeholder="Catatan / ruangan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
