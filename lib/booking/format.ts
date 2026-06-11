import {
  APP_TIME_ZONE,
  formatDateTimeInAppTz,
} from "@/lib/datetime/indonesia";

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBookingRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function formatTanggalIndo(isoOrYmd: string): string {
  const d = isoOrYmd.includes("T")
    ? new Date(isoOrYmd)
    : new Date(`${isoOrYmd}T12:00:00+07:00`);
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

export function formatTanggalPendek(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  if (d && m && y) return `${d}/${m}/${y}`;
  return ymd;
}

export function formatDateTimeIndo(iso: string): string {
  return formatDateTimeInAppTz(iso);
}

export function formatPaymentStatus(status: string | null | undefined): string {
  switch (status) {
    case "paid":
      return "Lunas";
    case "pending":
      return "Menunggu pembayaran";
    case "failed":
      return "Pembayaran gagal";
    case "expired":
      return "Kedaluwarsa";
    case "refunded":
      return "Dikembalikan";
    default:
      return status ? status : "—";
  }
}

export function paymentStatusBadgeClass(
  status: string | null | undefined
): string {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "failed":
    case "expired":
      return "bg-red-50 text-red-600 border border-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-600 border border-gray-200";
    default:
      return "bg-gray-50 text-gray-500 border border-gray-200";
  }
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

export function channelLabel(channel?: string | null): string {
  return channel === "home" ? "Home Service" : "Kunjungan Klinik";
}
