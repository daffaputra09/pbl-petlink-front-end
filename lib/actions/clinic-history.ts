"use server";

import { resolveConsultationDisplayStatus } from "@/lib/consultation/display-status";
import { fetchPaymentDetailsByReference } from "@/lib/booking/fetch-payment-details";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ConsultationHistoryItem,
  HandlingHistoryEntry,
  RiwayatStats,
  RiwayatStatusFilter,
  HandlingKindFilter,
} from "@/types/riwayat";
import type { ConsultationStatusFilter } from "@/lib/riwayat/consultation-status";
import { consultationDbStatusesFromFilter } from "@/lib/riwayat/consultation-status";
import type { DoctorScheduleKind } from "@/types/dokter";
import { requireClinicSession } from "./auth-guard";

const CONSULTATION_HISTORY_SELECT = `
  id, status, scheduled_start_at, scheduled_end_at, consultation_fee, completed_at,
  customer_id, doctor_id,
  customer_profiles (
    profiles ( name )
  ),
  doctor_profiles!consultations_doctor_id_fkey (
    profiles ( name )
  )
`;

const PAGE_SIZE = 20;

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function profileName(
  join: Record<string, unknown> | null | undefined
): string | null {
  if (!join) return null;
  const profiles = join.profiles;
  const profile = Array.isArray(profiles)
    ? (profiles[0] as Record<string, unknown> | undefined)
    : (profiles as Record<string, unknown> | undefined);
  return (profile?.name as string | undefined)?.trim() || null;
}

function isHandlingHistoryEntry(
  kind: DoctorScheduleKind,
  status: string | null,
  endsAt: string
): boolean {
  if (kind !== "booking" && kind !== "consultation") return false;
  if (status === "completed" || status === "cancelled") return true;
  return new Date(endsAt).getTime() < Date.now();
}

export async function fetchClinicConsultationHistoryPage(options: {
  page?: number;
  pageSize?: number;
  statusFilter?: ConsultationStatusFilter;
  doctorId?: string | null;
}): Promise<{ items: ConsultationHistoryItem[]; total: number }> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("consultations")
    .select(CONSULTATION_HISTORY_SELECT, { count: "exact" })
    .eq("clinic_id", clinicId)
    .order("scheduled_start_at", { ascending: false });

  const statuses = consultationDbStatusesFromFilter(
    options.statusFilter ?? "Semua"
  );
  if (statuses) query = query.in("status", statuses);

  if (options.doctorId) {
    query = query.eq("doctor_id", options.doctorId);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = data ?? [];
  const ids = rows.map((r) => r.id as string);
  const paymentByRef = await fetchPaymentDetailsByReference(
    admin,
    "consultation",
    ids,
    clinicId
  );

  const items: ConsultationHistoryItem[] = rows.map((row) => {
    const map = row as Record<string, unknown>;
    const id = map.id as string;
    const scheduledStartAt = map.scheduled_start_at as string;
    const scheduledEndAt = map.scheduled_end_at as string;
    const status = map.status as string;
    const payment = paymentByRef[id];

    const display = resolveConsultationDisplayStatus({
      consultationStatus: status,
      paymentStatus: payment?.status ?? null,
      scheduledStartAt: new Date(scheduledStartAt),
      scheduledEndAt: new Date(scheduledEndAt),
    });

    return {
      id,
      customerName:
        profileName(
          map.customer_profiles as Record<string, unknown> | undefined
        ) ?? "Customer",
      doctorName:
        profileName(
          first(
            map.doctor_profiles as
              | Record<string, unknown>
              | Record<string, unknown>[]
              | null
          ) ?? undefined
        ) ?? "Dokter",
      petName: null,
      scheduledStartAt,
      scheduledEndAt,
      status,
      displayLabel: display.label,
      displayKind: display.kind,
      consultationFee: Number(map.consultation_fee ?? 0),
      completedAt: (map.completed_at as string | null) ?? null,
      paymentStatus: payment?.status ?? null,
    };
  });

  return { items, total: count ?? items.length };
}

export async function listClinicDoctorHandlingHistory(options?: {
  statusFilter?: RiwayatStatusFilter;
  kindFilter?: HandlingKindFilter;
  doctorId?: string | null;
}): Promise<HandlingHistoryEntry[]> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const { data: doctors, error: doctorsError } = await admin
    .from("doctor_profiles")
    .select("id, profiles ( name )")
    .eq("clinic_id", clinicId);

  if (doctorsError) throw doctorsError;

  const doctorRows = doctors ?? [];
  const doctorIds = doctorRows.map((d) => d.id as string);
  if (doctorIds.length === 0) return [];

  const doctorNameById: Record<string, string> = {};
  for (const row of doctorRows) {
    const map = row as Record<string, unknown>;
    const profiles = map.profiles;
    const profile = Array.isArray(profiles)
      ? (profiles[0] as Record<string, unknown> | undefined)
      : (profiles as Record<string, unknown> | undefined);
    doctorNameById[map.id as string] =
      (profile?.name as string | undefined)?.trim() || "Dokter";
  }

  const filteredDoctorIds = options?.doctorId
    ? doctorIds.filter((id) => id === options.doctorId)
    : doctorIds;

  if (filteredDoctorIds.length === 0) return [];

  const { data, error } = await admin
    .from("doctor_schedules")
    .select(
      `
      id,
      doctor_id,
      starts_at,
      ends_at,
      booking_id,
      consultation_id,
      bookings (
        id, status, channel,
        customer_pets ( name ),
        customer_profiles ( profiles ( name ) )
      ),
      consultations (
        id, status,
        customer_profiles ( profiles ( name ) )
      )
    `
    )
    .in("doctor_id", filteredDoctorIds)
    .order("starts_at", { ascending: false });

  if (error) throw error;

  const kindFilter = options?.kindFilter ?? "Semua";
  const statusFilter = options?.statusFilter ?? "Semua";

  return (data ?? [])
    .map((row) => {
      const map = row as Record<string, unknown>;
      const booking = map.bookings as Record<string, unknown> | null;
      const consultation = map.consultations as Record<string, unknown> | null;
      const bookingId = map.booking_id as string | null;
      const consultationId = map.consultation_id as string | null;
      const doctorId = map.doctor_id as string;

      let kind: DoctorScheduleKind = "unknown";
      let referenceStatus: string | null = null;
      let referenceTitle = "Penanganan";
      let referenceSubtitle: string | null = null;

      if (bookingId) {
        kind = "booking";
        referenceStatus = (booking?.status as string) ?? null;
        const channel =
          booking?.channel === "home" ? "Home Service" : "Kunjungan Klinik";
        const petJoin = booking?.customer_pets;
        const pet = first(
          petJoin as { name?: string } | { name?: string }[] | null
        );
        const customerName = profileName(
          booking?.customer_profiles as Record<string, unknown> | undefined
        );
        const petName = pet?.name?.trim();
        referenceTitle =
          petName && customerName
            ? `${petName} · ${customerName}`
            : petName || customerName || "Booking layanan";
        referenceSubtitle = channel;
      } else if (consultationId) {
        kind = "consultation";
        referenceStatus = (consultation?.status as string) ?? null;
        const customerName = profileName(
          consultation?.customer_profiles as Record<string, unknown> | undefined
        );
        referenceTitle = customerName || "Konsultasi online";
        referenceSubtitle = "Konsultasi Online";
      } else {
        return null;
      }

      const entry: HandlingHistoryEntry = {
        id: map.id as string,
        doctorId,
        doctorName: doctorNameById[doctorId] ?? "Dokter",
        startsAt: map.starts_at as string,
        endsAt: map.ends_at as string,
        bookingId,
        consultationId,
        kind,
        referenceStatus,
        referenceTitle,
        referenceSubtitle,
      };

      if (!isHandlingHistoryEntry(entry.kind, entry.referenceStatus, entry.endsAt)) {
        return null;
      }
      if (kindFilter === "Booking" && entry.kind !== "booking") return null;
      if (kindFilter === "Konsultasi" && entry.kind !== "consultation") {
        return null;
      }
      if (statusFilter === "Selesai" && entry.referenceStatus !== "completed") {
        return null;
      }
      if (
        statusFilter === "Dibatalkan" &&
        entry.referenceStatus !== "cancelled"
      ) {
        return null;
      }
      return entry;
    })
    .filter((entry): entry is HandlingHistoryEntry => entry !== null);
}

export async function fetchClinicRiwayatStats(): Promise<RiwayatStats> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const [consultationTotalRes, consultationCompletedRes, bookingCompletedRes, doctorsRes] =
    await Promise.all([
    admin
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId),
    admin
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "completed"),
    admin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "completed"),
    admin.from("doctor_profiles").select("id").eq("clinic_id", clinicId),
  ]);

  const doctorIds = (doctorsRes.data ?? []).map((d) => d.id as string);

  let handlingTotal = 0;
  if (doctorIds.length > 0) {
    const { data: schedules } = await admin
      .from("doctor_schedules")
      .select(
        `
        ends_at, booking_id, consultation_id,
        bookings ( status ),
        consultations ( status )
      `
      )
      .in("doctor_id", doctorIds);

    handlingTotal = (schedules ?? []).filter((row) => {
      const map = row as Record<string, unknown>;
      const bookingId = map.booking_id as string | null;
      const consultationId = map.consultation_id as string | null;
      if (!bookingId && !consultationId) return false;

      let kind: DoctorScheduleKind = "unknown";
      let status: string | null = null;
      if (bookingId) {
        kind = "booking";
        status = (map.bookings as { status?: string } | null)?.status ?? null;
      } else {
        kind = "consultation";
        status =
          (map.consultations as { status?: string } | null)?.status ?? null;
      }
      return isHandlingHistoryEntry(
        kind,
        status,
        map.ends_at as string
      );
    }).length;
  }

  return {
    consultationTotal: consultationTotalRes.count ?? 0,
    consultationCompleted: consultationCompletedRes.count ?? 0,
    bookingCompleted: bookingCompletedRes.count ?? 0,
    handlingTotal,
  };
}

export async function searchClinicConsultationHistory(options: {
  statusFilter?: ConsultationStatusFilter;
  doctorId?: string | null;
  limit?: number;
}): Promise<ConsultationHistoryItem[]> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();
  const limit = options.limit ?? 500;

  let query = admin
    .from("consultations")
    .select(CONSULTATION_HISTORY_SELECT)
    .eq("clinic_id", clinicId)
    .order("scheduled_start_at", { ascending: false })
    .limit(limit);

  const statuses = consultationDbStatusesFromFilter(
    options.statusFilter ?? "Semua"
  );
  if (statuses) query = query.in("status", statuses);
  if (options.doctorId) query = query.eq("doctor_id", options.doctorId);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const ids = rows.map((r) => r.id as string);
  const paymentByRef = await fetchPaymentDetailsByReference(
    admin,
    "consultation",
    ids,
    clinicId
  );

  return rows.map((row) => {
    const map = row as Record<string, unknown>;
    const id = map.id as string;
    const scheduledStartAt = map.scheduled_start_at as string;
    const scheduledEndAt = map.scheduled_end_at as string;
    const status = map.status as string;
    const payment = paymentByRef[id];

    const display = resolveConsultationDisplayStatus({
      consultationStatus: status,
      paymentStatus: payment?.status ?? null,
      scheduledStartAt: new Date(scheduledStartAt),
      scheduledEndAt: new Date(scheduledEndAt),
    });

    return {
      id,
      customerName:
        profileName(
          map.customer_profiles as Record<string, unknown> | undefined
        ) ?? "Customer",
      doctorName:
        profileName(
          first(
            map.doctor_profiles as
              | Record<string, unknown>
              | Record<string, unknown>[]
              | null
          ) ?? undefined
        ) ?? "Dokter",
      petName: null,
      scheduledStartAt,
      scheduledEndAt,
      status,
      displayLabel: display.label,
      displayKind: display.kind,
      consultationFee: Number(map.consultation_fee ?? 0),
      completedAt: (map.completed_at as string | null) ?? null,
      paymentStatus: payment?.status ?? null,
    };
  });
}
