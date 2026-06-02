"use client";

import { useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import { Doctor, DoctorStatus } from "@/types/dokter";

const SPESIALISASI_OPTIONS = [
  "Bedah",
  "Orthopedics",
  "Dermatology",
  "General Praktek",
  "Neurologi",
  "Kardiologi",
  "Oftalmologi",
  "Onkologi",
];

const HARI = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AddDoctorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (doctor: Doctor, password?: string) => void;
  editData?: Doctor | null;
}

function generateId(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `VET-2024-${num}`;
}

export default function AddDoctorModal({
  open,
  onClose,
  onSave,
  editData,
}: AddDoctorModalProps) {
  const isEdit = !!editData;
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string>(editData?.photo ?? "");
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [email, setEmail] = useState(editData?.email ?? "");
  const [password, setPassword] = useState("");
  const [spesialisasi, setSpesialisasi] = useState<string>(
    editData?.spesialisasi[0] ?? ""
  );
  const [jadwal, setJadwal] = useState<string[]>(editData?.jadwal ?? []);
  const [biografi, setBiografi] = useState(editData?.biografi ?? "");
  const [phone, setPhone] = useState(editData?.phone ?? "");
  const [status, setStatus] = useState<DoctorStatus>(
    editData?.status ?? "Bertugas"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  function handlePhotoClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function toggleJadwal(hari: string) {
    setJadwal((prev) =>
      prev.includes(hari) ? prev.filter((h) => h !== hari) : [...prev, hari]
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!nama.trim()) e.nama = "Nama wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    if (!isEdit && !password.trim()) e.password = "Password wajib diisi";
    if (!spesialisasi) e.spesialisasi = "Pilih spesialisasi";
    if (!phone.trim()) e.phone = "Nomor HP wajib diisi";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const doc: Doctor = {
      id: editData?.id ?? generateId(),
      nama,
      email,
      phone,
      spesialisasi: [spesialisasi],
      status,
      photo,
      jadwal,
      biografi,
    };
    onSave(doc, password || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Dokter" : "Tambah Dokter"}
            </h2>
            <p className="text-xs text-gray-500">
              Mengelola, ketersediaan, dan spesialisasi klinis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          {/* Left – Photo */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-teal-400 hover:bg-teal-50 transition-colors flex flex-col items-center justify-center overflow-hidden relative group"
            >
              {photo ? (
                <>
                  <img
                    src={photo}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={28} className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Camera size={28} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400 text-center px-2">
                    Klik untuk upload foto
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-400 text-center">
              Profile Picture
            </p>
            <p className="text-[11px] text-gray-300 text-center">
              800×800px. JPG atau PNG.
            </p>
          </div>

          {/* Right – Form */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Nama */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="e.g. Dr. Jane Smith"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                  errors.nama ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.nama && (
                <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
              )}
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dokter@vetcarepro.com"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Phone & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Nomor HP
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                    errors.phone ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DoctorStatus)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
                >
                  <option value="Bertugas">Bertugas</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Operasi">Operasi</option>
                </select>
              </div>
            </div>

            {/* Spesialisasi */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Spesialisasi
              </label>
              <select
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white ${
                  errors.spesialisasi ? "border-red-400" : "border-gray-200"
                }`}
              >
                <option value="">Pilih Spesialisasi</option>
                {SPESIALISASI_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.spesialisasi && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.spesialisasi}
                </p>
              )}
            </div>

            {/* Jadwal Bekerja */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Jadwal Bekerja
              </label>
              <div className="flex flex-wrap gap-2">
                {HARI.map((hari) => (
                  <button
                    key={hari}
                    type="button"
                    onClick={() => toggleJadwal(hari)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      jadwal.includes(hari)
                        ? "bg-teal-700 text-white border-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-teal-300"
                    }`}
                  >
                    {hari}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Klik hari untuk beralih ketersediaan
              </p>
            </div>

            {/* Biografi */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Biografi
              </label>
              <textarea
                value={biografi}
                onChange={(e) => setBiografi(e.target.value)}
                rows={4}
                placeholder="Bagikan latar belakang profesional, bidang keahlian, dan pendekatan pribadi terhadap perawatan hewan..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
