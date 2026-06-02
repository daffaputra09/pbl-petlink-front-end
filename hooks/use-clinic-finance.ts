"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";

export interface WithdrawRow {
  id: string;
  tanggal: string;
  waktu: string;
  jumlah: number;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  status: "Berhasil" | "Gagal" | "Diproses";
}

export function useClinicFinance() {
  const { profile } = useClinicSession();
  const [balance, setBalance] = useState(0);
  const [pendapatanHariIni, setPendapatanHariIni] = useState(0);
  const [pendapatanBulanIni, setPendapatanBulanIni] = useState(0);
  const [grafikMingguan, setGrafikMingguan] = useState<
    { label: string; pendapatan: number }[]
  >([]);
  const [historyPenarikan, setHistoryPenarikan] = useState<WithdrawRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();

    const { data: clinic } = await supabase
      .from("clinic_profiles")
      .select("balance, bank_name, account_number, account_name")
      .eq("id", profile.id)
      .single();

    setBalance(Number(clinic?.balance ?? 0));

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: payments } = await supabase
      .from("payments")
      .select("amount, status, paid_at, created_at")
      .eq("clinic_id", profile.id)
      .eq("status", "paid");

    const paid = payments ?? [];
    const todaySum = paid
      .filter((p) => {
        const t = new Date(p.paid_at ?? p.created_at);
        return t >= startOfDay;
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    const monthSum = paid
      .filter((p) => {
        const t = new Date(p.paid_at ?? p.created_at);
        return t >= startOfMonth;
      })
      .reduce((s, p) => s + Number(p.amount), 0);

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
        .reduce((s, p) => s + Number(p.amount), 0);
      week.push({ label: dayLabels[d.getDay()], pendapatan: sum });
    }
    setGrafikMingguan(week);

    const { data: withdraws } = await supabase
      .from("withdraw_requests")
      .select("*")
      .eq("clinic_id", profile.id)
      .order("created_at", { ascending: false });

    setHistoryPenarikan(
      (withdraws ?? []).map((w) => {
        const created = new Date(w.created_at);
        const statusMap: Record<string, WithdrawRow["status"]> = {
          completed: "Berhasil",
          rejected: "Gagal",
          pending: "Diproses",
          approved: "Diproses",
        };
        return {
          id: w.id,
          tanggal: created.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          waktu: created.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          jumlah: Number(w.amount),
          namaBank: w.bank_name,
          nomorRekening: w.account_number,
          atasNama: w.account_name,
          status: statusMap[w.status] ?? "Diproses",
        };
      })
    );

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
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
    historyPenarikan,
    loading,
    refresh,
    requestWithdraw,
  };
}
