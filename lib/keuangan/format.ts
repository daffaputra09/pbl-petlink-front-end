import type { StatusPenarikan, WithdrawDbStatus } from "@/types/keuangan";

export type { StatusPenarikan, WithdrawDbStatus };
export {
  WITHDRAW_SUCCESS_DB_STATUSES,
  WITHDRAW_STATUS_FILTERS,
  mapWithdrawStatus,
  isWithdrawInProgress,
  isWithdrawSuccessful,
  withdrawFilterToDbStatuses,
} from "@/lib/keuangan/withdraw-status";
export type { WithdrawFilterValue } from "@/lib/keuangan/withdraw-status";

export function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  qris: "QRIS",
  bank_transfer: "Transfer Bank",
  credit_card: "Kartu Kredit",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  echannel: "Mandiri Bill",
  bca_va: "BCA Virtual Account",
  bni_va: "BNI Virtual Account",
  bri_va: "BRI Virtual Account",
  permata_va: "Permata Virtual Account",
  other_va: "Virtual Account",
};

export function formatPaymentMethod(
  paymentMethod: string | null | undefined,
  midtransPaymentType: string | null | undefined
): string {
  const raw = paymentMethod?.trim() || midtransPaymentType?.trim();
  if (!raw) return "Midtrans";
  const key = raw.toLowerCase().replace(/\s+/g, "_");
  return PAYMENT_METHOD_LABELS[key] ?? raw.replace(/_/g, " ").toUpperCase();
}

export function formatIncomeDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatIncomeTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
