"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { daftarBank } from "@/data/keuangan";
import { bankCodeFor } from "@/lib/auth/register-draft-types";
import {
  defaultOperatingHours,
  operatingHoursToRpcPayload,
  validateOperatingHours,
  type ClinicDayHours,
} from "@/lib/auth/register-draft";
import { mapOpeningHoursFromDb } from "@/lib/pengaturan/opening-hours";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export function useClinicSettings() {
  const { profile, signOut, refresh: refreshSession, loading: sessionLoading } = useClinicSession();
  const [clinicName, setClinicName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState(daftarBank[0]);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [days, setDays] = useState<ClinicDayHours[]>(defaultOperatingHours());
  const [isVerified, setIsVerified] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!profile) {
      if (!sessionLoading) setLoading(false);
      return;
    }

    setLoading(true);
    setClinicName(profile.name ?? "");
    const supabase = createClient();

    try {
      const [clinicRes, hoursRes] = await Promise.all([
        supabase
          .from("clinic_profiles")
          .select(
            "description, address, bank_name, account_name, account_number, is_verified"
          )
          .eq("id", profile.id)
          .single(),
        supabase
          .from("clinic_opening_hours")
          .select(
            `
          day_of_week, is_closed,
          clinic_opening_hour_periods ( opens_at, closes_at, sort_order )
        `
          )
          .eq("clinic_id", profile.id)
          .order("day_of_week"),
      ]);

      if (clinicRes.error) {
        notifyError("Gagal memuat data klinik.");
      } else if (clinicRes.data) {
        const data = clinicRes.data;
        setClinicName(profile.name ?? "");
        setDescription(data.description ?? "");
        setAddress(data.address ?? "");
        setBankName(data.bank_name ?? daftarBank[0]);
        setAccountName(data.account_name ?? "");
        setAccountNumber(data.account_number ?? "");
        setIsVerified(data.is_verified !== false);
      }

      if (hoursRes.error) {
        notifyError("Gagal memuat jam operasional.");
      } else if (hoursRes.data) {
        setDays(mapOpeningHoursFromDb(hoursRes.data));
      }
    } catch {
      notifyError("Gagal memuat pengaturan.");
    } finally {
      setLoading(false);
    }
  }, [profile, sessionLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (): Promise<void> => {
    if (!profile) {
      notifyError("Sesi klinik tidak valid.");
      return;
    }

    const trimmedName = clinicName.trim();
    if (!trimmedName) {
      notifyError("Nama klinik wajib diisi.");
      return;
    }

    const hoursError = validateOperatingHours(days);
    if (hoursError) {
      notifyError(hoursError);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: trimmedName })
        .eq("id", profile.id);

      if (profileError) {
        notifyError(profileError.message);
        return;
      }

      const { error: clinicError } = await supabase
        .from("clinic_profiles")
        .update({
          description: description.trim(),
          address: address.trim(),
          bank_name: bankName,
          account_name: accountName.trim(),
          account_number: accountNumber.trim(),
          bank_code: bankCodeFor(bankName),
        })
        .eq("id", profile.id);

      if (clinicError) {
        notifyError(clinicError.message);
        return;
      }

      const { error: hoursErrorRpc } = await supabase.rpc(
        "replace_clinic_opening_hours",
        {
          p_clinic_id: profile.id,
          p_days: operatingHoursToRpcPayload(days),
        }
      );

      if (hoursErrorRpc) {
        notifyError(hoursErrorRpc.message);
        return;
      }

      await refreshSession();
      notifySuccess("Pengaturan berhasil disimpan.");
    } catch {
      notifyError("Gagal menyimpan pengaturan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }, [profile, clinicName, description, address, bankName, accountName, accountNumber, days, refreshSession]);

  return {
    profile,
    clinicName,
    setClinicName,
    description,
    setDescription,
    address,
    setAddress,
    bankName,
    setBankName,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
    days,
    setDays,
    isVerified,
    loading: loading || sessionLoading,
    saving,
    save,
    signOut,
    reload: load,
  };
}
