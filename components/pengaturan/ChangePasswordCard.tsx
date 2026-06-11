"use client";

import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  KlinikPrimaryButton,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { Spinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";
import { useChangePassword } from "@/hooks/use-change-password";

export function ChangePasswordCard() {
  const [email, setEmail] = useState<string | undefined>();
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    saving,
    save,
  } = useChangePassword(email);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? undefined);
    });
  }, []);

  return (
    <KlinikSectionCard
      title="Keamanan Akun"
      description="Perbarui kata sandi login akun Anda"
    >
      <div className="px-5 py-4 space-y-4">
        {email ? (
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
            Akun: <span className="font-medium text-gray-700">{email}</span>
          </p>
        ) : null}
        <PasswordField
          label="Kata sandi saat ini"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <PasswordField
          label="Kata sandi baru"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordField
          label="Konfirmasi kata sandi baru"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <KlinikPrimaryButton
          icon={
            saving ? (
              <Spinner size={16} className="text-white" />
            ) : (
              <Save size={16} />
            )
          }
          disabled={saving || !email}
          onClick={() => void save()}
          className="w-full sm:w-auto justify-center"
        >
          {saving ? "Menyimpan..." : "Perbarui Kata Sandi"}
        </KlinikPrimaryButton>
        <p className="text-xs text-gray-400 inline-flex items-center gap-1.5">
          <KeyRound size={13} />
          Lupa kata sandi? Gunakan tautan &quot;Lupa kata sandi?&quot; di halaman
          login.
        </p>
      </div>
    </KlinikSectionCard>
  );
}
