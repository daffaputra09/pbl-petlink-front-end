import type { BookingStatus } from "@/types/booking";

export type BookingDisplayKind =
  | "belumDibayar"
  | "pembayaranGagal"
  | "terjadwal"
  | "berlangsung"
  | "selesai"
  | "dibatalkan";

export interface BookingDisplayStatus {
  kind: BookingDisplayKind;
  label: BookingStatus | "Belum dibayar" | "Berlangsung" | "Pembayaran gagal";
}

export function resolveBookingDisplayStatus(params: {
  bookingStatus: string;
  paymentStatus?: string | null;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
}): BookingDisplayStatus {
  const now = new Date();
  const { bookingStatus, paymentStatus, scheduledStartAt, scheduledEndAt } =
    params;

  if (bookingStatus === "cancelled") {
    return { kind: "dibatalkan", label: "Dibatalkan" };
  }

  if (bookingStatus === "pending") {
    if (
      paymentStatus === "failed" ||
      paymentStatus === "expired" ||
      paymentStatus === "refunded"
    ) {
      return { kind: "pembayaranGagal", label: "Pembayaran gagal" };
    }
    if (paymentStatus === "paid") {
      return { kind: "terjadwal", label: "Terjadwal" };
    }
    return { kind: "belumDibayar", label: "Belum dibayar" };
  }

  if (bookingStatus === "confirmed") {
    if (now >= scheduledStartAt && now < scheduledEndAt) {
      return { kind: "berlangsung", label: "Berlangsung" };
    }
    return { kind: "terjadwal", label: "Terjadwal" };
  }

  if (bookingStatus === "in_progress") {
    return { kind: "berlangsung", label: "Berlangsung" };
  }

  if (bookingStatus === "completed") {
    return { kind: "selesai", label: "Selesai" };
  }

  return { kind: "terjadwal", label: "Terjadwal" };
}

export function displayStatusToFilterLabel(
  display: BookingDisplayStatus
): BookingStatus | "Semua" {
  if (display.label === "Belum dibayar" || display.label === "Berlangsung") {
    return "Terjadwal";
  }
  if (display.label === "Pembayaran gagal") return "Dibatalkan";
  return display.label as BookingStatus;
}

export function dbStatusFromUiFilter(
  filter: BookingStatus
): string[] {
  switch (filter) {
    case "Terjadwal":
      return ["pending", "confirmed", "in_progress"];
    case "Selesai":
      return ["completed"];
    case "Dibatalkan":
      return ["cancelled"];
    default:
      return [];
  }
}
