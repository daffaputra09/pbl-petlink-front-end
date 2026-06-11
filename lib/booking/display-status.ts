import type { BookingStatus } from "@/types/booking";
import {
  displayKindToSemantic,
  statusBadgeClass,
} from "@/lib/booking/status-theme";

export type BookingDisplayKind =
  | "belumDibayar"
  | "pembayaranGagal"
  | "terjadwal"
  | "dikonfirmasi"
  | "menungguCheckIn"
  | "berlangsung"
  | "selesai"
  | "dibatalkan";

export interface BookingDisplayStatus {
  kind: BookingDisplayKind;
  /** Label tampilan — selaras dengan petlink (doctor & customer). */
  label: string;
  /** Status filter UI klinik (3 tab). */
  filterStatus: BookingStatus;
}

/**
 * Pemetaan status booking + pembayaran + channel + waktu.
 * Selaras dengan petlink/lib/shared/booking/doctor_schedule_display_status.dart
 * dan booking_display_status.dart.
 */
export function resolveBookingDisplayStatus(params: {
  bookingStatus: string;
  channel?: string | null;
  paymentStatus?: string | null;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
}): BookingDisplayStatus {
  const now = new Date();
  const { bookingStatus, paymentStatus, scheduledStartAt, scheduledEndAt } =
    params;
  const isHome = params.channel === "home";
  const inWindow = now >= scheduledStartAt && now < scheduledEndAt;

  if (bookingStatus === "cancelled") {
    return { kind: "dibatalkan", label: "Dibatalkan", filterStatus: "Dibatalkan" };
  }

  if (bookingStatus === "completed") {
    return { kind: "selesai", label: "Selesai", filterStatus: "Selesai" };
  }

  if (bookingStatus === "in_progress") {
    return { kind: "berlangsung", label: "Berlangsung", filterStatus: "Terjadwal" };
  }

  if (bookingStatus === "pending") {
    if (
      paymentStatus === "failed" ||
      paymentStatus === "expired" ||
      paymentStatus === "refunded"
    ) {
      return {
        kind: "pembayaranGagal",
        label: "Pembayaran gagal",
        filterStatus: "Dibatalkan",
      };
    }
    if (paymentStatus === "paid") {
      return { kind: "terjadwal", label: "Terjadwal", filterStatus: "Terjadwal" };
    }
    return {
      kind: "belumDibayar",
      label: "Belum dibayar",
      filterStatus: "Terjadwal",
    };
  }

  if (bookingStatus === "confirmed") {
    if (isHome && inWindow) {
      return {
        kind: "menungguCheckIn",
        label: "Menunggu Check-in",
        filterStatus: "Terjadwal",
      };
    }
    if (!isHome && inWindow) {
      return {
        kind: "berlangsung",
        label: "Berlangsung",
        filterStatus: "Terjadwal",
      };
    }
    return {
      kind: "dikonfirmasi",
      label: isHome ? "Dikonfirmasi" : "Terjadwal",
      filterStatus: "Terjadwal",
    };
  }

  return { kind: "terjadwal", label: "Terjadwal", filterStatus: "Terjadwal" };
}

export function displayStatusBadgeClass(
  kind: BookingDisplayKind
): string {
  return statusBadgeClass(displayKindToSemantic(kind));
}

export function displayStatusToFilterLabel(
  display: BookingDisplayStatus
): BookingStatus | "Semua" {
  return display.filterStatus;
}

export function dbStatusFromUiFilter(filter: BookingStatus): string[] {
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
