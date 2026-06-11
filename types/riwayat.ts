import type { ConsultationDisplayKind } from "@/lib/consultation/display-status";
import type { DoctorScheduleKind } from "@/types/dokter";

export type RiwayatTab = "Konsultasi" | "Booking Layanan" | "Penanganan Dokter";

export type RiwayatStatusFilter = "Semua" | "Selesai" | "Dibatalkan";

export type { ConsultationStatusFilter } from "@/lib/riwayat/consultation-status";

export type HandlingKindFilter = "Semua" | "Booking" | "Konsultasi";

export interface ConsultationHistoryItem {
  id: string;
  customerName: string;
  doctorName: string;
  petName: string | null;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
  displayLabel: string;
  displayKind: ConsultationDisplayKind;
  consultationFee: number;
  completedAt: string | null;
  paymentStatus: string | null;
}

export interface HandlingHistoryEntry {
  id: string;
  doctorId: string;
  doctorName: string;
  startsAt: string;
  endsAt: string;
  bookingId: string | null;
  consultationId: string | null;
  kind: DoctorScheduleKind;
  referenceStatus: string | null;
  referenceTitle: string;
  referenceSubtitle: string | null;
}

export interface RiwayatStats {
  consultationTotal: number;
  consultationCompleted: number;
  bookingCompleted: number;
  handlingTotal: number;
}
