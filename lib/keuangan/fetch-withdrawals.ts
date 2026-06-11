import type { SupabaseClient } from "@supabase/supabase-js";
import { mapWithdrawStatus, withdrawFilterToDbStatuses } from "@/lib/keuangan/format";
import type { HistoryPenarikan, WithdrawDbStatus } from "@/types/keuangan";
import type { WithdrawFilterValue } from "@/lib/keuangan/withdraw-status";

type WithdrawRow = {
  id: string;
  amount: number | string;
  status: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  created_at: string;
  rejection_reason: string | null;
  transfer_proof_url: string | null;
};

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  return Number.parseFloat(String(v ?? 0)) || 0;
}

function mapWithdrawRow(row: WithdrawRow): HistoryPenarikan {
  const created = new Date(row.created_at);
  const rawStatus = row.status as WithdrawDbStatus;
  return {
    id: row.id,
    tanggal: created.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    waktu: created.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    jumlah: toNumber(row.amount),
    namaBank: row.bank_name,
    nomorRekening: row.account_number,
    atasNama: row.account_name,
    status: mapWithdrawStatus(row.status),
    rawStatus,
    rejectionReason: row.rejection_reason,
    transferProofUrl: row.transfer_proof_url?.trim() || null,
    createdAt: row.created_at,
  };
}

export async function fetchClinicWithdrawals(
  supabase: SupabaseClient,
  clinicId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: WithdrawFilterValue;
  } = {}
): Promise<{ items: HistoryPenarikan[]; total: number }> {
  const { limit = 20, offset = 0, status = null } = options;

  let query = supabase
    .from("withdraw_requests")
    .select(
      "id, amount, status, bank_name, account_number, account_name, created_at, rejection_reason, transfer_proof_url",
      { count: "exact" }
    )
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  const dbStatuses = withdrawFilterToDbStatuses(status);
  if (dbStatuses) {
    query =
      dbStatuses.length === 1
        ? query.eq("status", dbStatuses[0])
        : query.in("status", dbStatuses);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;

  return {
    items: ((data ?? []) as WithdrawRow[]).map(mapWithdrawRow),
    total: count ?? 0,
  };
}
