export const ACTIVE_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
] as const;

export const ACTIVE_CONSULTATION_STATUSES = [
  "pending_payment",
  "scheduled",
  "in_progress",
] as const;

export type DoctorObligationSummary = {
  activeBookings: number;
  activeConsultations: number;
};

export function hasActiveDoctorObligations(
  summary: DoctorObligationSummary
): boolean {
  return summary.activeBookings > 0 || summary.activeConsultations > 0;
}

export function formatDoctorObligationMessage(
  summary: DoctorObligationSummary
): string {
  const parts: string[] = [];
  if (summary.activeBookings > 0) {
    parts.push(
      `${summary.activeBookings} booking belum selesai (menunggu, terjadwal, atau berlangsung)`
    );
  }
  if (summary.activeConsultations > 0) {
    parts.push(
      `${summary.activeConsultations} konsultasi belum selesai (menunggu pembayaran, terjadwal, atau berlangsung)`
    );
  }
  return parts.join(". ");
}
