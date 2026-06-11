"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import type { Doctor, DoctorFormInput } from "@/types/dokter";

interface AddDoctorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: DoctorFormInput) => Promise<void>;
  editData?: Doctor | null;
  saving?: boolean;
}

export default function AddDoctorModal({
  open,
  onClose,
  onSave,
  editData,
  saving = false,
}: AddDoctorModalProps) {
  const isEdit = !!editData;
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [spesialisasi, setSpesialisasi] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [consultationFee, setConsultationFee] = useState("0");
  const [bio, setBio] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setPhotoPreview(editData?.photo ?? "");
    setPhotoFile(null);
    setNama(editData?.nama ?? "");
    setEmail(editData?.email ?? "");
    setSpesialisasi(editData?.spesialisasi ?? "");
    setLicenseNumber(editData?.licenseNumber ?? "");
    setConsultationFee(String(editData?.consultationFee ?? 0));
    setBio(editData?.bio ?? "");
    setIsActive(editData?.isActive ?? true);
    setErrors({});
  }, [open, editData]);

  if (!open) return null;

  function handlePhotoClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!nama.trim()) e.nama = "Nama wajib diisi";
    if (!isEdit && !email.trim()) e.email = "Email wajib diisi";
    if (!spesialisasi.trim()) e.spesialisasi = "Spesialisasi wajib diisi";
    const fee = Number.parseFloat(consultationFee);
    if (Number.isNaN(fee) || fee < 0) {
      e.consultationFee = "Tarif konsultasi tidak valid";
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
      nama: nama.trim(),
      email: email.trim(),
      spesialisasi: spesialisasi.trim(),
      bio: bio.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      consultationFee: Number.parseFloat(consultationFee) || 0,
      isActive,
      photoFile,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit Dokter" : "Tambah Dokter"}
            </h2>
            <p className="text-xs text-gray-500">
              {isEdit
                ? "Data disimpan ke profiles & doctor_profiles (Supabase)"
                : "Dokter akan menerima email undangan untuk mengatur kata sandi"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-teal-400 hover:bg-teal-50 transition-colors flex flex-col items-center justify-center overflow-hidden relative group"
            >
              {photoPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
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
                    Upload foto profil
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
              Disimpan ke profiles.image_url
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.nama ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.nama && (
                <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email {isEdit ? "" : "*"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={isEdit}
                disabled={isEdit}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none ${
                  isEdit ? "bg-gray-50 text-gray-500" : "focus:ring-2 focus:ring-teal-500"
                } ${errors.email ? "border-red-400" : "border-gray-200"}`}
              />
              {isEdit ? (
                <p className="text-[11px] text-gray-400 mt-1">
                  Email akun auth tidak dapat diubah dari sini.
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Link atur kata sandi akan dikirim ke email ini.
                </p>
              )}
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Spesialisasi *
                </label>
                <input
                  type="text"
                  value={spesialisasi}
                  onChange={(e) => setSpesialisasi(e.target.value)}
                  placeholder="Contoh: Bedah, Dermatologi, General Praktek"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.spesialisasi ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.spesialisasi && (
                  <p className="text-xs text-red-500 mt-1">{errors.spesialisasi}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  No. STR / Izin Praktik
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="license_number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tarif Konsultasi (Rp) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.consultationFee ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.consultationFee && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.consultationFee}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Maps ke doctor_profiles.is_active
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="doctor_profiles.bio"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
