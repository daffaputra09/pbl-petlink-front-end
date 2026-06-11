"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { fetchClinicIncome } from "@/lib/keuangan/fetch-income";
import { fetchClinicWithdrawals } from "@/lib/keuangan/fetch-withdrawals";
import { WITHDRAW_SUCCESS_DB_STATUSES } from "@/lib/keuangan/withdraw-status";
import type { HistoryPenarikan, Pendapatan } from "@/types/keuangan";

const PREVIEW_LIMIT = 5;

export function useClinicFinance() {
  const { profile, loading: sessionLoading } = useClinicSession();
  const [balance, setBalance] = useState(0);
  const [pendapatanHariIni, setPendapatanHariIni] = useState(0);
  const [pendapatanBulanIni, setPendapatanBulanIni] = useState(0);
  const [grafikMingguan, setGrafikMingguan] = useState<
    { label: string; pendapatan: number }[]
  >([]);
  const [recentPendapatan, setRecentPendapatan] = useState<Pendapatan[]>([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [recentPenarikan, setRecentPenarikan] = useState<HistoryPenarikan[]>(
    []
  );
  const [totalPenarikan, setTotalPenarikan] = useState(0);
  const [totalPenarikanBerhasil, setTotalPenarikanBerhasil] = useState(0);
  const [pendingPenarikan, setPendingPenarikan] = useState(0);
  const [bankAccount, setBankAccount] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile) {
      if (!sessionLoading) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: clinic, error: clinicError } = await supabase
        .from("clinic_profiles")
        .select("balance, bank_name, account_number, account_name")
        .eq("id", profile.id)
        .single();

      if (clinicError) throw clinicError;

      setBalance(Number(clinic?.balance ?? 0));
      setBankAccount(
        clinic?.bank_name && clinic?.account_number
          ? {
              bankName: clinic.bank_name,
              accountNumber: clinic.account_number,
              accountName: clinic.account_name ?? "",
            }
          : null
      );

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select(
          "amount, platform_fee, clinic_net_amount, status, paid_at, created_at"
        )
        .eq("clinic_id", profile.id)
        .eq("status", "paid");

      if (paymentsError) throw paymentsError;

      const netAmount = (p: {
        amount: unknown;
        platform_fee?: unknown;
        clinic_net_amount?: unknown;
      }) => {
        if (p.clinic_net_amount != null) return Number(p.clinic_net_amount);
        return Number(p.amount ?? 0);
      };

      const paid = payments ?? [];
      const todaySum = paid
        .filter((p) => {
          const t = new Date(p.paid_at ?? p.created_at);
          return t >= startOfDay;
        })
        .reduce((s, p) => s + netAmount(p), 0);
      const monthSum = paid
        .filter((p) => {
          const t = new Date(p.paid_at ?? p.created_at);
          return t >= startOfMonth;
        })
        .reduce((s, p) => s + netAmount(p), 0);

      setPendapatanHariIni(todaySum);
      setPendapatanBulanIni(monthSum);

      const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const week: { label: string; pendapatan: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const sum = paid
          .filter((p) => {
            const t = new Date(p.paid_at ?? p.created_at);
            return t >= d && t < next;
          })
          .reduce((s, p) => s + netAmount(p), 0);
        week.push({ label: dayLabels[d.getDay()], pendapatan: sum });
      }
      setGrafikMingguan(week);

      const [
        incomeResult,
        withdrawResult,
        pendingCount,
        successfulWithdraws,
      ] = await Promise.all([
        fetchClinicIncome(supabase, profile.id, {
          limit: PREVIEW_LIMIT,
          offset: 0,
        }).catch((e) => {
          console.warn("fetchClinicIncome preview:", e);
          return { items: [] as Pendapatan[], total: 0 };
        }),
        fetchClinicWithdrawals(supabase, profile.id, {
          limit: PREVIEW_LIMIT,
          offset: 0,
        }).catch((e) => {
          console.warn("fetchClinicWithdrawals preview:", e);
          return { items: [] as HistoryPenarikan[], total: 0 };
        }),
        supabase
          .from("withdraw_requests")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", profile.id)
          .eq("status", "pending"),
        supabase
          .from("withdraw_requests")
          .select("amount")
          .eq("clinic_id", profile.id)
          .in("status", WITHDRAW_SUCCESS_DB_STATUSES),
      ]);

      setRecentPendapatan(incomeResult.items);
      setTotalPendapatan(incomeResult.total);
      setRecentPenarikan(withdrawResult.items);
      setTotalPenarikan(withdrawResult.total);
      setPendingPenarikan(pendingCount.count ?? 0);
      setTotalPenarikanBerhasil(
        (successfulWithdraws.data ?? []).reduce(
          (sum, row) => sum + Number(row.amount),
          0
        )
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Gagal memuat data keuangan";
      setError(message);
      console.error("useClinicFinance refresh:", e);
    } finally {
      setLoading(false);
    }
  }, [profile, sessionLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requestWithdraw = async (amount: number) => {
    if (!profile) return;
    const supabase = createClient();
    const { data: clinic } = await supabase
      .from("clinic_profiles")
      .select("bank_name, account_number, account_name, bank_code")
      .eq("id", profile.id)
      .single();

    if (!clinic?.bank_name || !clinic.account_number) {
      throw new Error("Lengkapi data bank di pengaturan klinik.");
    }

    const { error } = await supabase.from("withdraw_requests").insert({
      clinic_id: profile.id,
      amount,
      bank_name: clinic.bank_name,
      account_number: clinic.account_number,
      account_name: clinic.account_name,
      bank_code: clinic.bank_code,
    });
    if (error) throw error;
    await refresh();
  };

  return {
    balance,
    pendapatanHariIni,
    pendapatanBulanIni,
    grafikMingguan,
    recentPendapatan,
    totalPendapatan,
    recentPenarikan,
    totalPenarikan,
    totalPenarikanBerhasil,
    pendingPenarikan,
    bankAccount,
    loading: loading || sessionLoading,
    error,
    refresh,
    requestWithdraw,
  };
}
