import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CheckCircle2,
  Layers,
  MessageCircle,
} from "lucide-react";

/** Filter UI riwayat konsultasi (subset status enum Supabase). */
export type ConsultationStatusFilter =
  | "Semua"
  | "scheduled"
  | "in_progress"
  | "completed";

export const CONSULTATION_STATUS_DB_VALUES = [
  "pending_payment",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type ConsultationStatusDb =
  (typeof CONSULTATION_STATUS_DB_VALUES)[number];

export const CONSULTATION_STATUS_FILTER_OPTIONS: {
  value: ConsultationStatusFilter;
  label: string;
  description: string;
  icon: LucideIcon;
  activeClass: string;
}[] = [
  {
    value: "Semua",
    label: "Semua",
    description: "Tampilkan seluruh konsultasi",
    icon: Layers,
    activeClass: "bg-gray-800 text-white border-gray-800",
  },
  {
    value: "scheduled",
    label: "Terjadwal",
    description: "Konsultasi terjadwal, menunggu sesi",
    icon: CalendarCheck,
    activeClass: "bg-[#1E6B4F] text-white border-[#1E6B4F]",
  },
  {
    value: "in_progress",
    label: "Berlangsung",
    description: "Sesi konsultasi sedang aktif",
    icon: MessageCircle,
    activeClass: "bg-[#1565C0] text-white border-[#1565C0]",
  },
  {
    value: "completed",
    label: "Selesai",
    description: "Konsultasi telah selesai",
    icon: CheckCircle2,
    activeClass: "bg-emerald-600 text-white border-emerald-600",
  },
];

export function consultationStatusFilterLabel(
  filter: ConsultationStatusFilter
): string {
  return (
    CONSULTATION_STATUS_FILTER_OPTIONS.find((o) => o.value === filter)
      ?.label ?? filter
  );
}

export function consultationDbStatusesFromFilter(
  filter: ConsultationStatusFilter
): ConsultationStatusDb[] | null {
  if (filter === "Semua") return null;
  return [filter];
}
