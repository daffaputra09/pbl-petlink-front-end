"use client";

import { useSearchParams } from "next/navigation";
import { KeyRound, ShieldAlert } from "lucide-react";
import { AuthMarketingLayout } from "@/components/auth/AuthMarketingLayout";

/**
 * Landing page before Supabase verify — prevents email clients from
 * prefetching and consuming one-time invite/recovery tokens.
 */
export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash") ?? searchParams.get("token");
  const type = searchParams.get("type") ?? "invite";
  const next = searchParams.get("next") ?? "/auth/set-password";
  const pkceCode = searchParams.get("code");

  const isInvite = type === "invite";
  const isRecovery = type === "recovery";
  const hasValidType = isInvite || isRecovery;

  function proceed() {
    if (pkceCode) {
      const url = new URL("/auth/callback", window.location.origin);
      url.searchParams.set("code", pkceCode);
      url.searchParams.set("next", next);
      window.location.href = url.toString();
      return;
    }

    if (!tokenHash || !hasValidType) return;
    const url = new URL("/auth/confirm", window.location.origin);
    url.searchParams.set("token_hash", tokenHash);
    url.searchParams.set("type", type);
    url.searchParams.set("next", next);
    window.location.href = url.toString();
  }

  return (
    <AuthMarketingLayout
      heroTitle={isInvite ? "Aktivasi Akun Dokter" : "Reset Kata Sandi"}
      heroSubtitle={
        isInvite
          ? "Klinik Anda mendaftarkan akun dokter PetLink. Klik tombol di kanan untuk melanjutkan."
          : "Konfirmasi permintaan reset kata sandi PetLink Anda."
      }
    >
      <div className="flex min-h-dvh items-center justify-center p-6 lg:p-10 bg-gray-50">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
          {!tokenHash && !pkceCode ? (
            <>
              <h1 className="text-xl font-bold text-gray-900">Tautan tidak lengkap</h1>
              <p className="text-sm text-gray-600 mt-2">
                Parameter undangan tidak ditemukan. Buka ulang email dan klik
                tombol undangan.
              </p>
            </>
          ) : !hasValidType && !pkceCode ? (
            <>
              <h1 className="text-xl font-bold text-gray-900">Tautan tidak valid</h1>
              <p className="text-sm text-gray-600 mt-2">
                Jenis tautan tidak dikenali. Minta klinik atau admin mengirim
                ulang email.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                {isRecovery ? (
                  <KeyRound className="text-emerald-700" size={22} />
                ) : (
                  <ShieldAlert className="text-emerald-700" size={22} />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isInvite ? "Konfirmasi Undangan Dokter" : "Konfirmasi Reset Password"}
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {isInvite
                  ? "Tombol ini mengaktifkan akun dokter Anda dan membuka halaman pembuatan kata sandi."
                  : "Tombol ini membuka halaman untuk membuat kata sandi baru."}
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-4">
                Jika Anda sedang login sebagai klinik/admin di browser ini, sesi
                tersebut akan diganti dengan akun dari tautan ini.
              </p>
              <button
                type="button"
                onClick={proceed}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 text-sm transition"
              >
                {isInvite ? "Lanjutkan Aktivasi" : "Lanjutkan Reset Password"}
              </button>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Tautan sekali pakai — jangan bagikan ke orang lain.
              </p>
            </>
          )}
        </div>
      </div>
    </AuthMarketingLayout>
  );
}
