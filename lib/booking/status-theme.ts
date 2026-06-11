/**
 * Palet status booking/konsultasi — selaras dengan petlink `booking_status_theme.dart`.
 */
export type BookingStatusSemantic =
  | "unpaid"
  | "paymentFailed"
  | "scheduled"
  | "confirmed"
  | "waitingCheckIn"
  | "inProgress"
  | "completed"
  | "reviewed"
  | "cancelled";

export interface BookingStatusAppearance {
  badgeClass: string;
  dotClass: string;
}

const STATUS_APPEARANCE: Record<BookingStatusSemantic, BookingStatusAppearance> =
  {
    unpaid: {
      badgeClass: "bg-amber-50 text-amber-600 border border-amber-200",
      dotClass: "bg-amber-500",
    },
    paymentFailed: {
      badgeClass: "bg-red-50 text-red-600 border border-red-200",
      dotClass: "bg-red-500",
    },
    scheduled: {
      badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      dotClass: "bg-indigo-500",
    },
    confirmed: {
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dotClass: "bg-emerald-600",
    },
    waitingCheckIn: {
      badgeClass: "bg-orange-50 text-orange-600 border border-orange-200",
      dotClass: "bg-orange-500",
    },
    inProgress: {
      badgeClass: "bg-sky-50 text-sky-700 border border-sky-200",
      dotClass: "bg-sky-500",
    },
    completed: {
      badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    reviewed: {
      badgeClass: "bg-violet-50 text-violet-600 border border-violet-200",
      dotClass: "bg-violet-500",
    },
    cancelled: {
      badgeClass: "bg-gray-100 text-gray-500 border border-gray-200",
      dotClass: "bg-gray-400",
    },
  };

export function statusAppearance(
  semantic: BookingStatusSemantic
): BookingStatusAppearance {
  return STATUS_APPEARANCE[semantic];
}

export function statusBadgeClass(semantic: BookingStatusSemantic): string {
  return STATUS_APPEARANCE[semantic].badgeClass;
}

export function displayKindToSemantic(kind: string): BookingStatusSemantic {
  switch (kind) {
    case "belumDibayar":
      return "unpaid";
    case "pembayaranGagal":
      return "paymentFailed";
    case "terjadwal":
      return "scheduled";
    case "dikonfirmasi":
      return "confirmed";
    case "menungguCheckIn":
      return "waitingCheckIn";
    case "berlangsung":
      return "inProgress";
    case "selesai":
      return "completed";
    case "dinilai":
      return "reviewed";
    case "dibatalkan":
      return "cancelled";
    default:
      return "scheduled";
  }
}

export function dbStatusToSemantic(
  kind: "booking" | "consultation",
  status: string | null | undefined
): BookingStatusSemantic {
  const s = status ?? "";
  if (s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  if (s === "in_progress") return "inProgress";
  if (s === "pending_payment" || s === "pending") return "unpaid";
  if (s === "confirmed") return "confirmed";
  if (s === "scheduled") return "scheduled";
  return kind === "consultation" ? "scheduled" : "confirmed";
}
