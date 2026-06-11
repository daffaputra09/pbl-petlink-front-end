import type { DoctorScheduleKind } from "@/types/dokter";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, Stethoscope } from "lucide-react";
import {
  dbStatusToSemantic,
  statusBadgeClass,
} from "@/lib/booking/status-theme";

/** Selaras petlink `jadwal_doctor.dart` — Primary.s600 / Primary.s50 & biru konsultasi. */
export const SCHEDULE_KIND_STYLES = {
  booking: {
    accentColor: "#1E6B4F",
    backgroundColor: "#E8F5EF",
    borderClass: "border-[#1E6B4F]/20",
    badgeClass: "text-[#1E6B4F] bg-[#E8F5EF] border-[#1E6B4F]/25",
    iconBgClass: "bg-[#E8F5EF]",
    iconClass: "text-[#1E6B4F]",
    label: "Booking",
    Icon: Stethoscope,
  },
  consultation: {
    accentColor: "#1565C0",
    backgroundColor: "#E3F2FD",
    borderClass: "border-[#1565C0]/20",
    badgeClass: "text-[#1565C0] bg-[#E3F2FD] border-[#1565C0]/25",
    iconBgClass: "bg-[#E3F2FD]",
    iconClass: "text-[#1565C0]",
    label: "Konsultasi",
    Icon: MessageCircle,
  },
} as const satisfies Record<
  "booking" | "consultation",
  {
    accentColor: string;
    backgroundColor: string;
    borderClass: string;
    badgeClass: string;
    iconBgClass: string;
    iconClass: string;
    label: string;
    Icon: LucideIcon;
  }
>;

export function scheduleKindStyle(kind: DoctorScheduleKind) {
  if (kind === "consultation") return SCHEDULE_KIND_STYLES.consultation;
  return SCHEDULE_KIND_STYLES.booking;
}

export function formatScheduleReferenceStatus(
  kind: DoctorScheduleKind,
  status: string | null | undefined
): string {
  if (!status) return "—";

  if (kind === "consultation") {
    switch (status) {
      case "pending_payment":
        return "Menunggu Pembayaran";
      case "scheduled":
        return "Terjadwal";
      case "in_progress":
        return "Berlangsung";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  }

  switch (status) {
    case "pending":
      return "Menunggu";
    case "confirmed":
      return "Terjadwal";
    case "in_progress":
      return "Berlangsung";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status;
  }
}

export function scheduleStatusBadgeClass(
  kind: DoctorScheduleKind,
  status: string | null | undefined
): string {
  const bookingKind = kind === "consultation" ? "consultation" : "booking";
  return statusBadgeClass(dbStatusToSemantic(bookingKind, status));
}
