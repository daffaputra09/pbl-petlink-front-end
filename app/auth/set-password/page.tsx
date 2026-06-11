"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthMarketingLayout } from "@/components/auth/AuthMarketingLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { messageFromAuthError } from "@/lib/auth/errors";
import { useAuthLinkSession } from "@/lib/auth/use-auth-link-session";

export default function SetPasswordPage() {
  const { checking, sessionReady, submitError, setSubmitError } =
    useAuthLinkSession({
      invalidMessage:
        "Tautan tidak valid atau sudah kedaluwarsa. Hubungi klinik untuk mengirim ulang undangan.",
    });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const nextErrors: Record<string, string> = {};
    if (password.length < 6) {
      nextErrors.password = "Kata sandi minimal 6 karakter.";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role !== "doctor") {
          await supabase.auth.signOut();
          throw new Error("Tautan ini hanya untuk akun dokter.");
        }

        await supabase
          .from("profiles")
          .update({ password_set_at: new Date().toISOString() })
          .eq("id", user.id);
      }

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
      heroTitle="Atur Kata Sandi Dokter"
      heroSubtitle="Selesaikan aktivasi akun dokter PetLink. Setelah kata sandi dibuat, Anda dapat masuk melalui aplikasi mobile."
    >
      <div className="flex min-h-dvh items-center justify-center p-6 lg:p-10 bg-gray-50">
        <div className="w-full max-w-md">
          {checking ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
              <p className="text-sm">Memverifikasi tautan undangan...</p>
            </div>
          ) : done ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-600" size={28} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Kata sandi berhasil dibuat
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Akun dokter Anda sudah aktif. Silakan buka aplikasi mobile
                PetLink dan masuk dengan email serta kata sandi yang baru
                dibuat.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <Smartphone size={18} />
                Login via aplikasi PetLink (Dokter)
              </div>
            </div>
          ) : sessionReady ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900">Buat Kata Sandi</h1>
              <p className="text-sm text-gray-600 mt-2">
                Tentukan kata sandi untuk akun dokter PetLink Anda.
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
                  "Tautan undangan tidak dapat digunakan. Minta klinik Anda mengirim ulang undangan."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthMarketingLayout>
  );
}
