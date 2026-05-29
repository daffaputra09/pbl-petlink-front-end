"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {ChevronLeft, Clock, MapPin, Users, CalendarDays, Plus, Pencil,Trash2,} from "lucide-react";
import { DUMMY_DOCTORS } from "@/data/dokter";
import { DUMMY_JADWAL } from "@/data/jadwal";
import { JadwalDokter, HariKerja, StatusJadwal } from "@/types/jadwal";

const HARI_ORDER: HariKerja[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const STATUS_STYLES: Record<StatusJadwal, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Libur: "bg-gray-100 text-gray-500 border border-gray-200",
  Pengganti: "bg-amber-50 text-amber-700 border border-amber-200",
};

const HARI_COLORS: Record<HariKerja, string> = {
  Senin: "bg-teal-600",
  Selasa: "bg-blue-500",
  Rabu: "bg-violet-500",
  Kamis: "bg-orange-500",
  Jumat: "bg-rose-500",
  Sabtu: "bg-pink-500",
  Minggu: "bg-gray-400",
};

{/* Modal Tambah/Edit Jadwal */}
interface JadwalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (jadwal: JadwalDokter) => void;
  editData: JadwalDokter | null;
  doctorId: string;
}

function JadwalModal({
  open,
  onClose,
  onSave,
  editData,
  doctorId,
}: JadwalModalProps) {
  const [form, setForm] = useState<Omit<JadwalDokter, "id" | "doctorId">>({
    hari: editData?.hari ?? "Senin",
    jamMulai: editData?.jamMulai ?? "08:00",
    jamSelesai: editData?.jamSelesai ?? "12:00",
    ruangan: editData?.ruangan ?? "",
    kuotaPasien: editData?.kuotaPasien ?? 20,
    terdaftar: editData?.terdaftar ?? 0,
    status: editData?.status ?? "Aktif",
  });

  if (!open) return null;

  function handleSubmit() {
    if (!form.ruangan.trim()) return alert("Ruangan wajib diisi.");
    const jadwal: JadwalDokter = {
      id: editData?.id ?? `JDW-${Date.now()}`,
      doctorId,
      ...form,
    };
    onSave(jadwal);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          {editData ? "Edit Jadwal" : "Tambah Jadwal"}
        </h3>

        <div className="space-y-4">
          {/* Hari */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
              Hari
            </label>
            <select
              value={form.hari}
              onChange={(e) =>
                setForm({ ...form, hari: e.target.value as HariKerja })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {HARI_ORDER.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Jam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Jam Mulai
              </label>
              <input
                type="time"
                value={form.jamMulai}
                onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Jam Selesai
              </label>
              <input
                type="time"
                value={form.jamSelesai}
                onChange={(e) =>
                  setForm({ ...form, jamSelesai: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Ruangan */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
              Ruangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Poli Bedah A"
              value={form.ruangan}
              onChange={(e) => setForm({ ...form, ruangan: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Kuota */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
              Kuota Pasien
            </label>
            <input
              type="number"
              min={1}
              value={form.kuotaPasien}
              onChange={(e) =>
                setForm({ ...form, kuotaPasien: Number(e.target.value) })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as StatusJadwal })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="Aktif">Aktif</option>
              <option value="Libur">Libur</option>
              <option value="Pengganti">Pengganti</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function JadwalDokterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId") ?? "";

  const doctor = DUMMY_DOCTORS.find((d) => d.id === doctorId);
  const [jadwalList, setJadwalList] = useState<JadwalDokter[]>(
    DUMMY_JADWAL.filter((j) => j.doctorId === doctorId)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<JadwalDokter | null>(null);
  const [filterHari, setFilterHari] = useState<HariKerja | "Semua">("Semua");

  const filtered = useMemo(() => {
    const base =
      filterHari === "Semua"
        ? jadwalList
        : jadwalList.filter((j) => j.hari === filterHari);
    return [...base].sort(
      (a, b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari)
    );
  }, [jadwalList, filterHari]);

  // Stats
  const totalSesi = jadwalList.length;
  const totalKuota = jadwalList.reduce((s, j) => s + j.kuotaPasien, 0);
  const totalTerdaftar = jadwalList.reduce((s, j) => s + j.terdaftar, 0);
  const sesiAktif = jadwalList.filter((j) => j.status === "Aktif").length;

  function handleSave(jadwal: JadwalDokter) {
    setJadwalList((prev) => {
      const exists = prev.find((j) => j.id === jadwal.id);
      return exists ? prev.map((j) => (j.id === jadwal.id ? jadwal : j)) : [...prev, jadwal];
    });
  }

  function handleDelete(id: string) {
    if (confirm("Hapus jadwal ini?")) {
      setJadwalList((prev) => prev.filter((j) => j.id !== id));
    }
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <CalendarDays size={48} className="mb-3 opacity-30" />
        <p className="text-lg font-medium">Dokter tidak ditemukan.</p>
        <button
          onClick={() => router.push("/klinik/dokter")}
          className="mt-4 text-sm text-teal-600 hover:underline"
        >
          Kembali ke halaman dokter
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Back */}
      <button
        onClick={() => router.push("/klinik/dokter")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 mb-5 transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali ke Manajemen Dokter
      </button>

      {/* Doctor Info Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt={doctor.nama}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
              {doctor.nama.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{doctor.nama}</h1>
          <p className="text-sm text-gray-500">
            {doctor.spesialisasi.join(" · ")}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
            doctor.status === "Bertugas"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : doctor.status === "Cuti"
              ? "bg-gray-100 text-gray-500 border-gray-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {doctor.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Sesi", value: totalSesi, icon: CalendarDays, color: "text-teal-600" },
          { label: "Sesi Aktif", value: sesiAktif, icon: Clock, color: "text-emerald-600" },
          { label: "Total Kuota", value: totalKuota, icon: Users, color: "text-blue-600" },
          { label: "Terdaftar", value: totalTerdaftar, icon: Users, color: "text-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
          >
            <div className={`${color} mb-1`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Detail Jadwal Praktik</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Kelola sesi jadwal dokter ini
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Hari */}
            <select
              value={filterHari}
              onChange={(e) =>
                setFilterHari(e.target.value as HariKerja | "Semua")
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              <option value="Semua">Semua Hari</option>
              {HARI_ORDER.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setEditData(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} />
              Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Hari", "Jam Praktik", "Ruangan", "Kuota / Terdaftar", "Status", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                        h === "Aksi" ? "text-right px-6" : "text-left px-4"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-14 text-gray-400 text-sm"
                  >
                    Belum ada jadwal untuk hari ini.
                  </td>
                </tr>
              ) : (
                filtered.map((j) => {
                  const pct = Math.round((j.terdaftar / j.kuotaPasien) * 100);
                  return (
                    <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                      {/* Hari */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block text-xs font-semibold text-white px-2.5 py-1 rounded-full ${HARI_COLORS[j.hari]}`}
                        >
                          {j.hari}
                        </span>
                      </td>

                      {/* Jam */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Clock size={14} className="text-gray-400" />
                          {j.jamMulai} – {j.jamSelesai}
                        </div>
                      </td>

                      {/* Ruangan */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <MapPin size={14} className="text-gray-400" />
                          {j.ruangan}
                        </div>
                      </td>

                      {/* Kuota */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {j.terdaftar}/{j.kuotaPasien}
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 100
                                  ? "bg-red-400"
                                  : pct >= 70
                                  ? "bg-amber-400"
                                  : "bg-teal-400"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[j.status]}`}
                        >
                          {j.status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditData(j);
                              setModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(j.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-medium">{filtered.length}</span> dari{" "}
            <span className="font-medium">{jadwalList.length}</span> jadwal
          </p>
        </div>
      </div>

      {/* Modal */}
      <JadwalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
        doctorId={doctorId}
      />
    </>
  );
}
