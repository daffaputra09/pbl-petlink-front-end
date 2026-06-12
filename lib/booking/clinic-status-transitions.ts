import type { Booking } from "@/types/booking";

export type BookingDbStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ClinicStatusTransition {
  value: BookingDbStatus;
  label: string;
  description?: string;
  destructive?: boolean;
}

function isTerminalStatus(status: string | undefined): boolean {
  return status === "completed" || status === "cancelled";
}

function isBookingPaid(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === "paid";
}

function canConfirmFromPending(paymentStatus: string | null | undefined): boolean {
  if (!paymentStatus) return true;
  return isBookingPaid(paymentStatus);
}

function canCancelBooking(booking: Booking): boolean {
  return !isBookingPaid(booking.paymentStatus);
}

/**
 * Transisi status yang boleh dilakukan klinik dari portal.
 * Selaras dengan doctor_update_booking_status + aturan khusus klinik.
 */
export function getClinicStatusTransitions(
  booking: Booking
): ClinicStatusTransition[] {
  const current = (booking.rawStatus ?? "pending") as BookingDbStatus;
  const isHome = booking.channel === "home";

  if (isTerminalStatus(current)) return [];

  if (current === "pending") {
    const options: ClinicStatusTransition[] = [];
    if (canConfirmFromPending(booking.paymentStatus)) {
      options.push({
        value: "confirmed",
        label: "Konfirmasi booking",
        description:
          "Ubah ke terjadwal setelah pembayaran lunas atau booking manual.",
      });
    }
    if (canCancelBooking(booking)) {
      options.push({
        value: "cancelled",
        label: "Batalkan booking",
        description: "Batalkan janji dan lepaskan slot dokter.",
        destructive: true,
      });
    }
    return options;
  }

  if (current === "confirmed") {
    const options: ClinicStatusTransition[] = [];
    if (!isHome) {
      options.push({
        value: "in_progress",
        label: "Mulai layanan",
        description:
          "Tandai kunjungan sedang berlangsung. Dokter juga dapat memulai dari aplikasi.",
      });
    }
    options.push({
      value: "completed",
      label: "Tandai selesai",
      description: "Kunjungan telah selesai.",
    });
    if (canCancelBooking(booking)) {
      options.push({
        value: "cancelled",
        label: "Batalkan booking",
        description: "Batalkan janji dan lepaskan slot dokter.",
        destructive: true,
      });
    }
    return options;
  }

  if (current === "in_progress") {
    return [
      {
        value: "completed",
        label: "Tandai selesai",
        description: "Kunjungan telah selesai.",
      },
    ];
  }

  return [];
}

export function canClinicAssignDoctor(booking: Booking): boolean {
  const current = booking.rawStatus ?? "pending";
  return !isTerminalStatus(current) && current !== "in_progress";
}

export function canClinicReschedule(booking: Booking): boolean {
  const current = booking.rawStatus ?? "pending";
  return !isTerminalStatus(current) && current !== "in_progress";
}
