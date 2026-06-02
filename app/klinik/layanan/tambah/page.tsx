"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClinicServices } from "@/hooks/use-clinic-services";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  ChevronDown,
  CirclePlus,
  HeartPulse,
  Info,
  Loader2,
  Microscope,
  Scissors,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Syringe,
  Tag,
} from "lucide-react";

interface IconOption {
  id: string;
  label: string;
  svg: ReactNode;
}

const ICONS: IconOption[] = [
  {
    id: "shield-plus",
    label: "Shield Plus",
    svg: <ShieldPlus className="w-5 h-5" />,
  },
  {
    id: "syringe",
    label: "Syringe",
    svg: <Syringe className="w-5 h-5" />,
  },
  {
    id: "stethoscope",
    label: "Stethoscope",
    svg: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: "cross",
    label: "Cross",
    svg: <HeartPulse className="w-5 h-5" />,
  },
  {
    id: "scissors",
    label: "Scissors",
    svg: <Scissors className="w-5 h-5" />,
  },
  {
    id: "microscope",
    label: "Microscope",
    svg: <Microscope className="w-5 h-5" />,
  },
  {
    id: "plus-circle",
    label: "Plus Circle",
    svg: <CirclePlus className="w-5 h-5" />,
  },
];

const CATEGORIES = [
  "Rutinitas Perawatan",
  "Spesialisasi",
  "Kesehatan",
  "Kebersihan",
  "Laboratorium",
  "Darurat",
  "Nutrisi",
  "Lainnya",
] as const;

interface FormState {
  nama: string;
  deskripsi: string;
  kategori: string;
  harga: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function TambahLayananPage() {
  const router = useRouter();
  const { upsert } = useClinicServices();

  const [selectedIcon, setSelectedIcon] =
    useState<string>("shield-plus");

  const [form, setForm] = useState<FormState>({
    nama: "",
    deskripsi: "",
    kategori: "",
    harga: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!form.nama.trim())
      e.nama = "Nama layanan wajib diisi";

    if (!form.deskripsi.trim())
      e.deskripsi = "Deskripsi wajib diisi";

    if (!form.kategori)
      e.kategori = "Pilih kategori terlebih dahulu";

    if (!form.harga || isNaN(Number(form.harga.replace(/\D/g, ""))))
      e.harga = "Masukkan harga yang valid";

    return e;
  };

  const handleSave = async (): Promise<void> => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSaving(true);
    try {
      const price = Number(form.harga.replace(/\D/g, ""));
      await upsert({
        name: form.nama.trim(),
        description: form.deskripsi.trim(),
        price,
        durationMinutes: 60,
        isClinicService: true,
        isHomeService: false,
        isActive: true,
      });
      router.push("/klinik/layanan");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan layanan");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof FormState,
    value: string
  ): void => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const formatHarga = (val: string): string => {
    const num = val.replace(/\D/g, "");

    return num
      ? Number(num).toLocaleString("id-ID")
      : "";
  };

  const activeIcon = ICONS.find(
    (i) => i.id === selectedIcon
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        
        <div className="flex items-center gap-3">
          <Link href="/klinik/layanan">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Tambah Layanan
            </h1>

            <p className="text-sm text-gray-500 mt-0.5">
              Kelola dan perbarui layanan medis dan harga klinik Anda.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Informasi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            
            <h2 className="flex items-center gap-2 font-bold text-gray-800 text-base mb-5">
              <Info className="w-5 h-5 text-emerald-500" />
              Informasi Umum
            </h2>

            <div className="flex flex-col gap-4">

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Layanan
                </label>

                <input
                  type="text"
                  placeholder="contoh. Annual Health Check-up"
                  value={form.nama}
                  onChange={(e) =>
                    handleChange("nama", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                    errors.nama
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />

                {errors.nama && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.nama}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>

                <textarea
                  rows={5}
                  placeholder="Rincian lengkap mengenai apa saja yang termasuk dalam layanan ini..."
                  value={form.deskripsi}
                  onChange={(e) =>
                    handleChange(
                      "deskripsi",
                      e.target.value
                    )
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none ${
                    errors.deskripsi
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />

                {errors.deskripsi && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.deskripsi}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <h2 className="flex items-center gap-2 font-bold text-gray-800 text-base mb-5">
              <Tag className="w-5 h-5 text-emerald-500" />
              Klasifikasi dan Harga
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori
                </label>

                <div className="relative">
                  <select
                    value={form.kategori}
                    onChange={(e) =>
                      handleChange(
                        "kategori",
                        e.target.value
                      )
                    }
                    className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all bg-white pr-10 ${
                      errors.kategori
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <option value="" disabled>
                      Pilih Kategori
                    </option>

                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {errors.kategori && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.kategori}
                  </p>
                )}
              </div>

              {/* Harga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga (Rp)
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.harga}
                    onChange={(e) =>
                      handleChange(
                        "harga",
                        formatHarga(e.target.value)
                      )
                    }
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
                      errors.harga
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  />
                </div>

                {errors.harga && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.harga}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">

          {/* Icon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <h2 className="flex items-center gap-2 font-bold text-gray-800 text-base mb-5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Pilihan Ikon
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() =>
                    setSelectedIcon(icon.id)
                  }
                  title={icon.label}
                  className={`w-full aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${
                    selectedIcon === icon.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {icon.svg}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-emerald-700 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-base mb-2">
              💡 Pro Tip
            </h3>

            <p className="text-sm leading-relaxed text-emerald-100">
              Gunakan nama layanan yang jelas dan mudah dipahami agar pengguna lebih cepat menemukan layanan.
            </p>
          </div>

          {/* Preview */}
          {form.nama && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Preview
              </p>

              <div className="flex items-center gap-3 mb-2">
                
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  {activeIcon?.svg}
                </div>

                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    {form.nama}
                  </p>

                  {form.kategori && (
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                      {form.kategori}
                    </p>
                  )}
                </div>

                {form.harga && (
                  <span className="ml-auto text-sm font-semibold text-gray-500">
                    Rp. {form.harga}
                  </span>
                )}
              </div>

              {form.deskripsi && (
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {form.deskripsi}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}