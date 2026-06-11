import type { StatusPenarikan, WithdrawDbStatus } from "@/types/keuangan";

/** Status DB yang dianggap penarikan berhasil (approved = final). */
export const WITHDRAW_SUCCESS_DB_STATUSES: WithdrawDbStatus[] = [
  "approved",
  "completed",
];

export type WithdrawFilterValue =
  | WithdrawDbStatus
  | "success"
  | null;

/** Filter UI riwayat penarikan klinik. */
export const WITHDRAW_STATUS_FILTERS = [
  { value: null, label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "success", label: "Berhasil" },
  { value: "rejected", label: "Ditolak" },
] as const satisfies ReadonlyArray<{
  value: WithdrawFilterValue;
  label: string;
}>;

export function mapWithdrawStatus(status: string): StatusPenarikan {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "approved":
    case "completed":
      return "Berhasil";
    case "rejected":
      return "Ditolak";
    default:
      return "Menunggu";
  }
}

export function isWithdrawInProgress(rawStatus: WithdrawDbStatus): boolean {
  return rawStatus === "pending";
}

export function isWithdrawSuccessful(rawStatus: WithdrawDbStatus): boolean {
  return WITHDRAW_SUCCESS_DB_STATUSES.includes(rawStatus);
}

export function withdrawFilterToDbStatuses(
  filter: WithdrawFilterValue
): WithdrawDbStatus[] | null {
  if (filter === null) return null;
  if (filter === "success") return WITHDRAW_SUCCESS_DB_STATUSES;
  return [filter];
}
