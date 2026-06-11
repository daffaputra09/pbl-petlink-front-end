import type { ConsultationDisplayKind } from "@/lib/consultation/display-status";

export interface ConsultationScheduleDetail {
  id: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  consultationFee: number;
  notes: string | null;
  chatThreadId: string | null;
  completedAt: string | null;
  customerId: string;
  customerName: string;
  customerAddress: string | null;
  clinicName: string;
  doctorName: string | null;
  paymentStatus: string | null;
  paymentAmount: number | null;
  paidAt: string | null;
  paymentMethod: string | null;
  displayLabel: string;
  displayKind: ConsultationDisplayKind;
  displayDescription: string;
}
