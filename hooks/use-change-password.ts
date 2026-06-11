"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { messageFromAuthError } from "@/lib/auth/errors";
import { validatePasswordChange } from "@/lib/auth/validation";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export function useChangePassword(email: string | undefined) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (): Promise<boolean> => {
    if (!email) {
      notifyError("Email akun tidak ditemukan.");
      return false;
    }

    const validationError = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword
    );
    if (validationError) {
      notifyError(validationError);
      return false;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) {
        notifyError("Kata sandi saat ini salah.");
        return false;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notifySuccess("Kata sandi berhasil diperbarui.");
      return true;
    } catch (err) {
      notifyError(messageFromAuthError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [confirmPassword, currentPassword, email, newPassword]);

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    saving,
    save,
  };
}
