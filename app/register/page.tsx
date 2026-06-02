"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  saveRegisterDraft,
} from "@/lib/auth/register-draft";
import {
  sanitizeDigitsOnly,
  validateAccountStepFull,
} from "@/lib/auth/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const err = validateAccountStepFull(
      email,
      password,
      confirmPassword,
      phone
    );
    if (err) {
      setError(err);
      return;
    }
    saveRegisterDraft({
      account: {
        email: email.trim(),
        password,
        phone: sanitizeDigitsOnly(phone),
      },
    });
    router.push("/register/klinik");
  }

  return (
    <AuthShell
      title="Buat akun klinik"
      subtitle="Langkah pertama — kredensial untuk portal PetLink"
      step={1}
      totalSteps={4}
      heroTitle="Daftar klinik baru"
      heroSubtitle="Mulai kelola klinik hewan Anda secara digital dalam beberapa menit."
    >
      <form onSubmit={handleNext} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}
        <AuthTextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="klinik@email.com"
        />
        <AuthTextField
          label="Nomor telepon"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(sanitizeDigitsOnly(e.target.value))}
          placeholder="08xxxxxxxxxx"
          hint="Hanya angka 0–9"
        />
        <PasswordField
          label="Kata sandi"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Konfirmasi kata sandi"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          Lanjut
        </button>
        <p className="text-sm text-center text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
