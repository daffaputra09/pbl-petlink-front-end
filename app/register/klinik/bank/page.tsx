"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { daftarBank } from "@/data/keuangan";
import {
  clearRegisterDraft,
  loadRegisterDraft,
  loadRegisterPhoto,
  type ClinicRegisterDraft,
} from "@/lib/auth/register-draft";
import { registerClinic } from "@/lib/auth/register-clinic";
import { messageFromAuthError } from "@/lib/auth/errors";
import { sanitizeDigitsOnly } from "@/lib/auth/validation";

export default function RegisterBankPage() {
  const router = useRouter();
  const [bankName, setBankName] = useState(daftarBank[0]);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const draft = loadRegisterDraft();
    if (!draft.operatingHours?.length) {
      router.replace("/register/klinik/jam");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName.trim() || !accountNumber.trim()) {
      setError("Data rekening wajib diisi.");
      return;
    }
    const digits = sanitizeDigitsOnly(accountNumber);
    if (digits.length < 8) {
      setError("Nomor rekening minimal 8 digit.");
      return;
    }

    const partial = loadRegisterDraft();
    if (!partial.account || !partial.clinicName || !partial.operatingHours) {
      setError("Data registrasi tidak lengkap. Mulai dari awal.");
      return;
    }

    const photoFile = await loadRegisterPhoto();

    const draft: ClinicRegisterDraft = {
      account: partial.account,
      clinicName: partial.clinicName,
      description: partial.description ?? "",
      address: partial.address ?? "",
      latitude: partial.latitude ?? -7.9666,
      longitude: partial.longitude ?? 112.6326,
      operatingHours: partial.operatingHours,
      bankName,
      accountName: accountName.trim(),
      accountNumber: digits,
      photoFile,
    };

    setLoading(true);
    setError("");
    try {
      await registerClinic(draft);
      clearRegisterDraft();
      setSuccess(true);
    } catch (err) {
      setError(messageFromAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthShell title="Registrasi berhasil" step={4} totalSteps={4}>
        <div className="text-center py-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Akun klinik Anda telah dibuat. Silakan masuk untuk mengelola klinik.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full justify-center bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Ke halaman masuk
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Rekening bank"
      subtitle="Untuk pencairan pendapatan klinik"
      step={4}
      totalSteps={4}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">Bank</label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            {daftarBank.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <AuthTextField
          label="Nama pemilik rekening"
          required
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <AuthTextField
          label="Nomor rekening"
          required
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) =>
            setAccountNumber(sanitizeDigitsOnly(e.target.value))
          }
          hint="Hanya angka 0–9"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Selesaikan pendaftaran
        </button>
      </form>
    </AuthShell>
  );
}
