"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  User,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { FormPenarikan } from "@/types/keuangan";
import { daftarBank } from "@/data/keuangan";
import { useClinicFinance } from "@/hooks/use-clinic-finance";

const MIN_PENARIKAN = 100_000;

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

function parseAngka(val: string): number {
  return parseInt(val.replace(/\D/g, ""), 10) || 0;
}

function formatInput(val: string): string {
  const angka = val.replace(/\D/g, "");
  if (!angka) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(angka, 10));
}

export default function PenarikanPage() {
  const router = useRouter();
  const { balance, requestWithdraw } = useClinicFinance();
  const SALDO_TERSEDIA = balance;
  const [form, setForm] = useState<FormPenarikan>({
    jumlah: "",
    namaBank: "",
    nomorRekening: "",
    atasNama: "",
  });
  const [bankOpen, setBankOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormPenarikan>>({});

  const jumlahAngka = parseAngka(form.jumlah);
  const sisaSaldo = SALDO_TERSEDIA - jumlahAngka;

  const validate = () => {
    const e: Partial<FormPenarikan> = {};
    if (!form.jumlah) e.jumlah = "Jumlah wajib diisi";
    else if (jumlahAngka < MIN_PENARIKAN)
      e.jumlah = `Minimal penarikan ${formatRupiah(MIN_PENARIKAN)}`;
    else if (jumlahAngka > SALDO_TERSEDIA) e.jumlah = "Jumlah melebihi saldo tersedia";
    if (!form.namaBank) e.namaBank = "Pilih bank tujuan";
    if (!form.nomorRekening) e.nomorRekening = "Nomor rekening wajib diisi";
    else if (!/^\d{8,16}$/.test(form.nomorRekening))
      e.nomorRekening = "Nomor rekening tidak valid";
    if (!form.atasNama) e.atasNama = "Nama pemilik rekening wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await requestWithdraw(jumlahAngka);
      setSuccess(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengajukan penarikan");
    } finally {
      setLoading(false);
    }
  };

  const handleNominalCepat = (val: number) => {
    setForm((prev) => ({ ...prev, jumlah: formatInput(String(val)) }));
    setErrors((prev) => ({ ...prev, jumlah: undefined }));
  };

  if (success) {
    return (
      <div className="flex flex-col bg-gray-50 items-center justify-center gap-6 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Permintaan Dikirim</h2>
            <p className="text-sm text-gray-500 mt-1">
              Penarikan sebesar{" "}
              <span className="font-semibold text-gray-800">{formatRupiah(jumlahAngka)}</span> ke{" "}
              <span className="font-semibold text-gray-800">{form.namaBank}</span> sedang diproses.
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Dana akan masuk dalam 1×24 jam hari kerja.
          </p>
          <button
            onClick={() => router.push("/klinik/keuangan")}
            className="w-full bg-[#1E6B4F] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#165a3f] transition"
          >
            Kembali ke Keuangan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Tarik Dana</h1>
            <p className="text-xs text-gray-400 mt-0.5">Transfer ke rekening bank</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-5">
        <div className="max-w-xl mx-auto flex flex-col gap-5">

          {/* Saldo Card */}
          <div className="bg-[#1E6B4F] rounded-2xl p-5 text-white">
            <p className="text-sm text-white/70 mb-1">Saldo Tersedia</p>
            <p className="text-3xl font-bold tracking-tight">{formatRupiah(SALDO_TERSEDIA)}</p>
            <p className="text-xs text-white/50 mt-2">PetLife Klinik</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">

            {/* Jumlah Penarikan */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Jumlah Penarikan</label>
              <div className={`flex items-center border rounded-xl px-4 py-3 gap-2 transition ${errors.jumlah ? "border-red-300 bg-red-50" : "border-gray-200 focus-within:border-[#1E6B4F] focus-within:ring-2 focus-within:ring-[#1E6B4F]/10"}`}>
                <span className="text-sm text-gray-400 font-medium shrink-0">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.jumlah}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, jumlah: formatInput(e.target.value) }));
                    setErrors((p) => ({ ...p, jumlah: undefined }));
                  }}
                  className="flex-1 text-sm text-gray-900 font-semibold outline-none bg-transparent placeholder:font-normal placeholder:text-gray-300"
                />
              </div>
              {errors.jumlah && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.jumlah}
                </p>
              )}
              {form.jumlah && !errors.jumlah && jumlahAngka <= SALDO_TERSEDIA && (
                <p className="text-xs text-gray-400">
                  Sisa saldo:{" "}
                  <span className="font-semibold text-gray-600">{formatRupiah(sisaSaldo)}</span>
                </p>
              )}

              {/* Nominal Cepat */}
              <div className="flex gap-2 flex-wrap">
                {[500_000, 1_000_000, 2_500_000, 5_000_000].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleNominalCepat(val)}
                    className="text-xs bg-[#E8F5EE] text-[#1E6B4F] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1E6B4F] hover:text-white transition"
                  >
                    {formatRupiah(val)}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Bank Tujuan */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Building2 size={14} className="text-[#1E6B4F]" />
                Bank Tujuan
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBankOpen(!bankOpen)}
                  className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm transition ${
                    errors.namaBank ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-[#1E6B4F]"
                  } ${form.namaBank ? "text-gray-900 font-medium" : "text-gray-400"}`}
                >
                  {form.namaBank || "Pilih bank tujuan"}
                  <ChevronDown size={16} className={`transition-transform ${bankOpen ? "rotate-180" : ""}`} />
                </button>
                {bankOpen && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg overflow-hidden">
                    {daftarBank.map((bank) => (
                      <button
                        key={bank}
                        onClick={() => {
                          setForm((p) => ({ ...p, namaBank: bank }));
                          setErrors((p) => ({ ...p, namaBank: undefined }));
                          setBankOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-[#E8F5EE] hover:text-[#1E6B4F] transition ${
                          form.namaBank === bank ? "bg-[#E8F5EE] text-[#1E6B4F] font-semibold" : "text-gray-700"
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.namaBank && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.namaBank}
                </p>
              )}
            </div>

            {/* Nomor Rekening */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#1E6B4F]" />
                Nomor Rekening
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 1234567890"
                value={form.nomorRekening}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setForm((p) => ({ ...p, nomorRekening: val }));
                  setErrors((p) => ({ ...p, nomorRekening: undefined }));
                }}
                className={`border rounded-xl px-4 py-3 text-sm outline-none transition ${
                  errors.nomorRekening
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-[#1E6B4F] focus:ring-2 focus:ring-[#1E6B4F]/10"
                }`}
              />
              {errors.nomorRekening && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.nomorRekening}
                </p>
              )}
            </div>

            {/* Atas Nama */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <User size={14} className="text-[#1E6B4F]" />
                Atas Nama
              </label>
              <input
                type="text"
                placeholder="Nama sesuai rekening"
                value={form.atasNama}
                onChange={(e) => {
                  setForm((p) => ({ ...p, atasNama: e.target.value }));
                  setErrors((p) => ({ ...p, atasNama: undefined }));
                }}
                className={`border rounded-xl px-4 py-3 text-sm outline-none transition ${
                  errors.atasNama
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-[#1E6B4F] focus:ring-2 focus:ring-[#1E6B4F]/10"
                }`}
              />
              {errors.atasNama && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.atasNama}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2">
              <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Pastikan nomor rekening dan nama pemilik sudah benar. Kesalahan data tidak dapat
                dikoreksi setelah permintaan dikirim.
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#1E6B4F] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#165a3f] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                "Ajukan Penarikan"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
