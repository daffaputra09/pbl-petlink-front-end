"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { messageFromAuthError } from "@/lib/auth/errors";
import { passwordResetRedirectUrl } from "@/lib/auth/site-url";
import { validateEmail } from "@/lib/auth/validation";
import { AuthMarketingLayout } from "@/components/auth/AuthMarketingLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }
    setEmailError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: passwordResetRedirectUrl() }
      );
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(messageFromAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthMarketingLayout
      heroTitle="Lupa kata sandi?"
      heroSubtitle="Kami akan mengirimkan tautan reset ke email terdaftar Anda."
    >
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg xl:max-w-xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium hover:underline mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke login
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-600" size={28} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Email reset terkirim
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Jika <strong>{email.trim()}</strong> terdaftar, Anda akan
                menerima email berisi tautan untuk mengatur kata sandi baru.
                Periksa folder spam jika tidak muncul dalam beberapa menit.
              </p>
              <Link
                href="/login"
                className="inline-flex mt-6 text-sm font-semibold text-emerald-700 hover:underline"
              >
                Kembali ke login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Reset Kata Sandi
                </h1>
                <p className="text-sm text-gray-500 mt-2">
                  Masukkan email akun klinik atau admin Anda.
                </p>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                {error ? (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                ) : null}
                <AuthTextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  error={emailError}
                  placeholder="nama@email.com"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm shadow-emerald-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  Kirim Tautan Reset
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AuthMarketingLayout>
  );
}
