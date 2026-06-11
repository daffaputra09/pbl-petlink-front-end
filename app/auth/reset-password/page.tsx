"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthMarketingLayout } from "@/components/auth/AuthMarketingLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { messageFromAuthError } from "@/lib/auth/errors";
import { validateNewPasswordPair } from "@/lib/auth/validation";
import { useAuthLinkSession } from "@/lib/auth/use-auth-link-session";

export default function ResetPasswordPage() {
  const { checking, sessionReady, submitError, setSubmitError } =
    useAuthLinkSession({
      invalidMessage:
        "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman lupa kata sandi.",
    });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const nextErrors = validateNewPasswordPair(password, confirmPassword);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setDone(true);
    } catch (err) {
      setSubmitError(messageFromAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthMarketingLayout
      heroTitle="Reset Kata Sandi"
      heroSubtitle="Buat kata sandi baru untuk akun PetLink Anda."
    >
      <div className="flex min-h-dvh items-center justify-center p-6 lg:p-10 bg-gray-50">
        <div className="w-full max-w-md">
          {checking ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
              <p className="text-sm">Memverifikasi tautan reset...</p>
            </div>
          ) : done ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-600" size={28} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Kata sandi berhasil diperbarui
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Silakan masuk dengan kata sandi baru Anda.
              </p>
              <Link
                href="/login"
                className="inline-flex mt-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-3 text-sm transition"
              >
                Ke halaman login
              </Link>
            </div>
          ) : sessionReady ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900">Kata Sandi Baru</h1>
              <p className="text-sm text-gray-600 mt-2">
                Tentukan kata sandi baru untuk akun Anda.
              </p>
              <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
                <PasswordField
                  label="Kata sandi baru"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                />
                <PasswordField
                  label="Konfirmasi kata sandi"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={fieldErrors.confirmPassword}
                />
                {submitError ? (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 text-sm transition disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Kata Sandi"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Tautan tidak valid
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {submitError ||
                  "Tautan reset tidak dapat digunakan. Minta tautan baru."}
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex mt-6 text-sm font-semibold text-emerald-700 hover:underline"
              >
                Minta tautan reset baru
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthMarketingLayout>
  );
}
