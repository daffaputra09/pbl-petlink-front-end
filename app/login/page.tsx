"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { messageFromAuthError } from "@/lib/auth/errors";
import { AuthMarketingLayout } from "@/components/auth/AuthMarketingLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PasswordField } from "@/components/auth/PasswordField";
import { validateEmail } from "@/lib/auth/validation";

function defaultNextForRole(role: string): string {
  if (role === "admin") return "/admin/dashboard";
  return "/klinik/dashboard";
}

function errorMessageForParam(param: string | null): string {
  if (param === "bukan_klinik") {
    return "Akun ini bukan akun klinik. Gunakan portal yang sesuai.";
  }
  if (param === "bukan_admin") {
    return "Akun ini bukan akun admin. Gunakan portal yang sesuai.";
  }
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState(errorMessageForParam(errorParam));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const eErr = validateEmail(email);
    if (eErr) {
      setEmailError(eErr);
      return;
    }
    setEmailError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        { email: email.trim(), password }
      );
      if (signInError) throw signInError;
      if (!data.user) throw new Error("Login gagal.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile || (profile.role !== "clinic" && profile.role !== "admin")) {
        await supabase.auth.signOut();
        setError("Akun ini tidak memiliki akses ke portal PetLink.");
        return;
      }
      if (profile.is_active === false) {
        await supabase.auth.signOut();
        setError("Akun tidak aktif. Hubungi administrator.");
        return;
      }

      let destination = defaultNextForRole(profile.role);
      if (nextParam) {
        if (profile.role === "admin" && nextParam.startsWith("/admin")) {
          destination = nextParam;
        } else if (profile.role === "clinic" && nextParam.startsWith("/klinik")) {
          destination = nextParam;
        }
      }

      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(messageFromAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthMarketingLayout
      heroTitle="Selamat datang kembali"
      heroSubtitle="Masuk ke portal PetLink untuk mengelola klinik atau administrasi platform."
    >
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg xl:max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Masuk PetLink
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Gunakan akun klinik atau admin yang sudah terdaftar.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
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
              onBlur={() => {
                const err = validateEmail(email);
                if (err) setEmailError(err);
              }}
              error={emailError}
              placeholder="nama@email.com"
            />
            <PasswordField
              label="Kata sandi"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="flex justify-end -mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-emerald-600 font-medium hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm shadow-emerald-600/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Masuk
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6 pt-6 border-t border-gray-100">
            Belum punya akun klinik?{" "}
            <Link
              href="/register"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Daftar klinik
            </Link>
          </p>
        </div>
      </div>
    </AuthMarketingLayout>
  );
}
