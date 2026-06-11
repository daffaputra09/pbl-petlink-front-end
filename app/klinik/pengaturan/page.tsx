"use client";

import {
  Building2,
  CreditCard,
  FileText,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  User,
  Stethoscope,
} from "lucide-react";
import OperatingHoursEditor from "@/components/pengaturan/OperatingHoursEditor";
import { ProfilePhotoPicker } from "@/components/auth/ProfilePhotoPicker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  KlinikPageLayout,
  KlinikPageLoading,
  KlinikSectionCard,
  KlinikPrimaryButton,
  KlinikSecondaryButton,
} from "@/components/klinik/KlinikPageLayout";
import { Spinner } from "@/components/ui/Spinner";
import { daftarBank } from "@/data/keuangan";
import { useClinicSettings } from "@/hooks/use-clinic-settings";

function FieldGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 inline-flex items-center gap-2">
        <span className="text-[#1E6B4F]">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function PengaturanPage() {
  const {
    profile,
    photoPreview,
    onPhotoChange,
    onPhotoClear,
    clinicName,
    setClinicName,
    description,
    setDescription,
    address,
    setAddress,
    bankName,
    setBankName,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
    days,
    setDays,
    isVerified,
    loading,
    saving,
    save,
    signOut,
  } = useClinicSettings();

  const initials = (clinicName || profile?.name || "K")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <KlinikPageLayout
      title="Pengaturan"
      description="Kelola profil, rekening, dan jam operasional klinik"
      maxWidth="6xl"
    >
      {loading ? (
        <KlinikPageLoading message="Memuat pengaturan..." />
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E6B4F] to-[#2a8a66] p-6 text-white shadow-md overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-4">
              {photoPreview || profile?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview ?? profile?.imageUrl ?? ""}
                  alt={profile?.name ?? clinicName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold border-2 border-white/30">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold truncate">
                  {clinicName || profile?.name}
                </h2>
                <p className="text-sm text-white/80 mt-0.5">
                  Akun klinik PetLink
                </p>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium bg-white/20 rounded-full px-2.5 py-1">
                    <ShieldCheck size={13} />
                    Terverifikasi
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <KlinikSectionCard
              title="Informasi Klinik"
              description="Deskripsi dan alamat yang ditampilkan ke pelanggan"
            >
              <div className="px-5 py-4 space-y-4">
                <ProfilePhotoPicker
                  previewUrl={photoPreview ?? profile?.imageUrl ?? null}
                  onChange={onPhotoChange}
                  onClear={onPhotoClear}
                />
                <FieldGroup label="Nama klinik" icon={<Stethoscope size={15} />}>
                  <Input
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Nama klinik yang ditampilkan ke pelanggan"
                    className="rounded-xl border-gray-200 h-10 focus-visible:ring-[#1E6B4F]/30"
                  />
                </FieldGroup>
                <FieldGroup label="Deskripsi" icon={<FileText size={15} />}>
                  <Textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ceritakan layanan dan keunggulan klinik..."
                    className="rounded-xl border-gray-200 resize-none focus-visible:ring-[#1E6B4F]/30"
                  />
                </FieldGroup>
                <FieldGroup label="Alamat" icon={<MapPin size={15} />}>
                  <Textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat lengkap klinik"
                    className="rounded-xl border-gray-200 resize-none focus-visible:ring-[#1E6B4F]/30"
                  />
                </FieldGroup>
              </div>
            </KlinikSectionCard>

            <KlinikSectionCard
              title="Rekening Bank"
              description="Digunakan untuk penarikan saldo klinik"
            >
              <div className="px-5 py-4 space-y-4">
                <FieldGroup label="Bank" icon={<Building2 size={15} />}>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B4F]/20 focus:border-[#1E6B4F]/40"
                  >
                    {daftarBank.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup
                  label="Nama pemilik rekening"
                  icon={<User size={15} />}
                >
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Sesuai buku tabungan"
                    className="rounded-xl border-gray-200 h-10 focus-visible:ring-[#1E6B4F]/30"
                  />
                </FieldGroup>
                <FieldGroup
                  label="Nomor rekening"
                  icon={<CreditCard size={15} />}
                >
                  <Input
                    value={accountNumber}
                    onChange={(e) =>
                      setAccountNumber(e.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    placeholder="Contoh: 1234567890"
                    className="rounded-xl border-gray-200 h-10 font-mono tracking-wide focus-visible:ring-[#1E6B4F]/30"
                  />
                </FieldGroup>
              </div>
            </KlinikSectionCard>
          </div>

          <KlinikSectionCard
            title="Jam Operasional"
            description="Jadwal buka klinik per hari — mempengaruhi slot booking"
          >
            <OperatingHoursEditor days={days} onChange={setDays} />
          </KlinikSectionCard>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <KlinikPrimaryButton
              icon={
                saving ? (
                  <Spinner size={16} className="text-white" />
                ) : (
                  <Save size={16} />
                )
              }
              disabled={saving}
              onClick={() => void save()}
              className="sm:flex-1 justify-center"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </KlinikPrimaryButton>
            <KlinikSecondaryButton
              icon={<LogOut size={16} />}
              onClick={() => signOut()}
              className="sm:w-auto justify-center text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
            >
              Keluar
            </KlinikSecondaryButton>
          </div>
        </>
      )}
    </KlinikPageLayout>
  );
}
