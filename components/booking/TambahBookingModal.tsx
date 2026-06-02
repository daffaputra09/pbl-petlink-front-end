"use client";

import { useState } from "react";
import { X, User, PawPrint, CalendarDays, Loader2 } from "lucide-react";
import { Booking, JenisKelamin } from "@/types/booking";
import { useClinicServices } from "@/hooks/use-clinic-services";
import { useClinicDoctors } from "@/hooks/use-clinic-doctors";
import { lookupCustomerByEmail } from "@/lib/actions/lookup-customer";
import { provisionCustomerWithPet } from "@/lib/actions/customer-provision";

export type ManualBookingPayload = {
  customerId: string;
  petId: string;
  doctorId?: string;
  serviceIds: string[];
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  notes?: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (payload: ManualBookingPayload) => Promise<void>;
};

type FormState = Omit<Booking, "id">;

const INITIAL_FORM: FormState = {
  namaPasien: "",
  jenis: "",
  kategori: "",
  usia: "",
  beratKg: 0,
  jenisKelamin: "Jantan",
  namaPemilik: "",
  alamatPemilik: "",
  emailPemilik: "",
  telpPemilik: "",
  jamMulai: "",
  jamSelesai: "",
  tanggal: "",
  status: "Terjadwal",
};

const KATEGORI_OPTIONS = ["Kucing", "Anjing", "Kelinci", "Hamster", "Burung", "Lainnya"];

// ✅ Didefinisikan di LUAR komponen utama
const inputClass = (err?: string) =>
  `w-full border rounded-lg px-3 py-2 text-sm text-gray-700 outline-none transition-colors ${
    err
      ? "border-red-300 bg-red-50 focus:border-red-400"
      : "border-gray-200 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
  }`;

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="text-gray-400">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function TambahBookingModal({ onClose, onSubmit }: Props) {
  const { services } = useClinicServices();
  const { doctors } = useClinicDoctors();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "beratKg" ? parseFloat(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.namaPasien) newErrors.namaPasien = "Wajib diisi";
    if (!form.kategori) newErrors.kategori = "Wajib dipilih";
    if (!form.namaPemilik) newErrors.namaPemilik = "Wajib diisi";
    if (!form.telpPemilik) newErrors.telpPemilik = "Wajib diisi";
    if (!form.emailPemilik.trim()) newErrors.emailPemilik = "Email wajib untuk pelanggan";
    if (!serviceId) newErrors.namaPasien = "Pilih layanan";
    if (!form.tanggal) newErrors.tanggal = "Wajib diisi";
    if (!form.jamMulai) newErrors.jamMulai = "Wajib diisi";
    if (!form.jamSelesai) newErrors.jamSelesai = "Wajib diisi";
    else if (form.jamMulai && form.jamMulai >= form.jamSelesai)
      newErrors.jamSelesai = "Harus setelah jam mulai";
    if (form.beratKg <= 0) newErrors.beratKg = "Harus lebih dari 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const email = form.emailPemilik.trim();
      let customerId: string;
      let petId: string;

      const existing = await lookupCustomerByEmail(email);
      const birthYear = new Date().getFullYear() - 1;
      const sex = form.jenisKelamin === "Betina" ? "female" : "male";

      if (existing) {
        customerId = existing.customerId;
        const provisioned = await provisionCustomerWithPet({
          email,
          password: "petlink-temp-1",
          name: form.namaPemilik.trim(),
          phone: form.telpPemilik,
          address: form.alamatPemilik,
          petName: form.namaPasien.trim(),
          petTypeName: form.kategori,
          breed: form.jenis,
          sex: sex as "male" | "female",
          birthMonth: 1,
          birthYear,
        });
        petId = provisioned.petId;
      } else {
        const provisioned = await provisionCustomerWithPet({
          email,
          password: "petlink-temp-1",
          name: form.namaPemilik.trim(),
          phone: form.telpPemilik,
          address: form.alamatPemilik,
          petName: form.namaPasien.trim(),
          petTypeName: form.kategori,
          breed: form.jenis,
          sex: sex as "male" | "female",
          birthMonth: 1,
          birthYear,
        });
        customerId = provisioned.customerId;
        petId = provisioned.petId;
      }

      await onSubmit({
        customerId,
        petId,
        doctorId: doctorId || undefined,
        serviceIds: [serviceId],
        tanggal: form.tanggal,
        jamMulai: form.jamMulai,
        jamSelesai: form.jamSelesai,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Tambah Booking</h2>
            <p className="text-xs text-gray-400 mt-0.5">Isi detail janji temu baru</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Informasi Pasien */}
          <div>
            <SectionHeader icon={<PawPrint size={14} />} label="Informasi Pasien" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Nama Pasien (Hewan)" required error={errors.namaPasien}>
                  <input
                    name="namaPasien"
                    value={form.namaPasien}
                    onChange={handleChange}
                    placeholder="Contoh: Chiko"
                    className={inputClass(errors.namaPasien)}
                  />
                </Field>
              </div>

              <Field label="Kategori" required error={errors.kategori}>
                <select
                  name="kategori"
                  value={form.kategori}
                  onChange={handleChange}
                  className={inputClass(errors.kategori)}
                >
                  <option value="">Pilih kategori</option>
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </Field>

              <Field label="Jenis / Ras" error={errors.jenis}>
                <input
                  name="jenis"
                  value={form.jenis}
                  onChange={handleChange}
                  placeholder="Contoh: Anggora"
                  className={inputClass(errors.jenis)}
                />
              </Field>

              <Field label="Usia" error={errors.usia}>
                <input
                  name="usia"
                  value={form.usia}
                  onChange={handleChange}
                  placeholder="Contoh: 2 Tahun"
                  className={inputClass(errors.usia)}
                />
              </Field>

              <Field label="Berat (kg)" required error={errors.beratKg}>
                <input
                  type="number"
                  name="beratKg"
                  value={form.beratKg === 0 ? "" : form.beratKg}
                  onChange={handleChange}
                  min={0}
                  step={0.1}
                  placeholder="Contoh: 3.5"
                  className={inputClass(errors.beratKg)}
                />
              </Field>

              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {(["Jantan", "Betina"] as JenisKelamin[]).map((jk) => (
                    <button
                      key={jk}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, jenisKelamin: jk }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.jenisKelamin === jk
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {jk === "Jantan" ? "♂ Jantan" : "♀ Betina"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Informasi Pemilik */}
          <div>
            <SectionHeader icon={<User size={14} />} label="Informasi Pemilik" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Nama Pemilik" required error={errors.namaPemilik}>
                  <input
                    name="namaPemilik"
                    value={form.namaPemilik}
                    onChange={handleChange}
                    placeholder="Nama lengkap pemilik"
                    className={inputClass(errors.namaPemilik)}
                  />
                </Field>
              </div>

              <div className="col-span-2">
                <Field label="Alamat" error={errors.alamatPemilik}>
                  <input
                    name="alamatPemilik"
                    value={form.alamatPemilik}
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    className={inputClass(errors.alamatPemilik)}
                  />
                </Field>
              </div>

              <Field label="Email" error={errors.emailPemilik}>
                <input
                  type="email"
                  name="emailPemilik"
                  value={form.emailPemilik}
                  onChange={handleChange}
                  placeholder="email@contoh.com"
                  className={inputClass(errors.emailPemilik)}
                />
              </Field>

              <Field label="No. Telepon" required error={errors.telpPemilik}>
                <input
                  type="tel"
                  name="telpPemilik"
                  value={form.telpPemilik}
                  onChange={handleChange}
                  placeholder="08xx-xxxx-xxxx"
                  className={inputClass(errors.telpPemilik)}
                />
              </Field>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <SectionHeader icon={<PawPrint size={14} />} label="Layanan & Dokter" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Layanan" required>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className={inputClass()}
                  >
                    <option value="">Pilih layanan</option>
                    {services
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — Rp {s.price.toLocaleString("id-ID")}
                        </option>
                      ))}
                  </select>
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Dokter (opsional)">
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className={inputClass()}
                  >
                    <option value="">Tanpa dokter</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Jadwal */}
          <div>
            <SectionHeader icon={<CalendarDays size={14} />} label="Jadwal" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Tanggal" required error={errors.tanggal}>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    className={inputClass(errors.tanggal)}
                  />
                </Field>
              </div>

              <Field label="Jam Mulai" required error={errors.jamMulai}>
                <input
                  type="time"
                  name="jamMulai"
                  value={form.jamMulai}
                  onChange={handleChange}
                  className={inputClass(errors.jamMulai)}
                />
              </Field>

              <Field label="Jam Selesai" required error={errors.jamSelesai}>
                <input
                  type="time"
                  name="jamSelesai"
                  value={form.jamSelesai}
                  onChange={handleChange}
                  className={inputClass(errors.jamSelesai)}
                />
              </Field>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan Booking
          </button>
        </div>
      </div>
    </div>
  );
}
