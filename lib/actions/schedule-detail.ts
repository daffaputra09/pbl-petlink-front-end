"use server";

import { fetchCustomerNamesById } from "@/lib/booking/fetch-customer-names";
import {
  fetchPaymentDetailsByBookingId,
  fetchPaymentDetailsByReference,
} from "@/lib/booking/fetch-payment-details";
import { BOOKING_LIST_SELECT, mapBookingRow } from "@/lib/booking/mappers";
import { resolveConsultationDisplayStatus } from "@/lib/consultation/display-status";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Booking } from "@/types/booking";
import type { ConsultationScheduleDetail } from "@/types/schedule-detail";
import { requireClinicSession } from "./auth-guard";

const CONSULTATION_DETAIL_SELECT = `
  id, status, scheduled_start_at, scheduled_end_at, consultation_fee, notes,
  chat_thread_id, completed_at, customer_id, doctor_id,
  customer_profiles (
    address,
    profiles ( name )
  ),
  clinic_profiles (
    profiles ( name )
  ),
  doctor_profiles!consultations_doctor_id_fkey (
    profiles ( name )
  )
`;

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  return Number.parseFloat(String(v ?? 0)) || 0;
}

export async function fetchClinicScheduleBookingDetail(
  bookingId: string
): Promise<Booking> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("bookings")
    .select(BOOKING_LIST_SELECT)
    .eq("id", bookingId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Booking tidak ditemukan.");

  const customerId = data.customer_id as string;
  const [paymentByBooking, nameByCustomer] = await Promise.all([
    fetchPaymentDetailsByBookingId(admin, [bookingId], clinicId),
    fetchCustomerNamesById(admin, [customerId]),
  ]);

  const payment = paymentByBooking[bookingId];
  const booking = mapBookingRow(data, {
    ownerName: nameByCustomer[customerId],
    paymentStatus: payment?.status ?? null,
    paymentAmount: payment?.amount ?? null,
    paidAt: payment?.paidAt ?? null,
    paymentMethod: payment?.paymentMethod ?? null,
    midtransOrderId: payment?.midtransOrderId ?? null,
  });
  booking.customerId = customerId;
  return booking;
}

export async function fetchClinicScheduleConsultationDetail(
  consultationId: string
): Promise<ConsultationScheduleDetail> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("consultations")
    .select(CONSULTATION_DETAIL_SELECT)
    .eq("id", consultationId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Konsultasi tidak ditemukan.");

  const row = data as Record<string, unknown>;
  const customerProfile = first(
    first(row.customer_profiles as { profiles?: unknown } | null)?.profiles as
      | { name?: string }
      | { name?: string }[]
      | null
  );
  const clinicProfile = first(
    first(row.clinic_profiles as { profiles?: unknown } | null)?.profiles as
      | { name?: string }
      | { name?: string }[]
      | null
  );
  const doctorJoin = first(row.doctor_profiles as { profiles?: unknown } | null);
  const doctorProfile = first(
    doctorJoin?.profiles as { name?: string } | { name?: string }[] | null
  );
  const customerAddress =
    first(row.customer_profiles as { address?: string | null } | null)
      ?.address ?? null;

  const paymentByRef = await fetchPaymentDetailsByReference(
    admin,
    "consultation",
    [consultationId],
    clinicId
  );
  const payment = paymentByRef[consultationId];

  const scheduledStartAt = row.scheduled_start_at as string;
  const scheduledEndAt = row.scheduled_end_at as string;
  const status = row.status as string;

  const display = resolveConsultationDisplayStatus({
    consultationStatus: status,
    paymentStatus: payment?.status ?? null,
    scheduledStartAt: new Date(scheduledStartAt),
    scheduledEndAt: new Date(scheduledEndAt),
  });

  return {
    id: row.id as string,
    status,
    scheduledStartAt,
    scheduledEndAt,
    consultationFee: toNumber(row.consultation_fee),
    notes: (row.notes as string | null) ?? null,
    chatThreadId: (row.chat_thread_id as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    customerId: row.customer_id as string,
    customerName: customerProfile?.name ?? "Customer",
    customerAddress,
    clinicName: clinicProfile?.name ?? "Klinik",
    doctorName: doctorProfile?.name ?? null,
    paymentStatus: payment?.status ?? null,
    paymentAmount: payment?.amount ?? null,
    paidAt: payment?.paidAt ?? null,
    paymentMethod: payment?.paymentMethod ?? null,
    displayLabel: display.label,
    displayKind: display.kind,
    displayDescription: display.description,
  };
}
