"use server";

import { requireClinicSession } from "./auth-guard";

export interface DoctorTimeOffInput {
  doctorId: string;
  /** ISO datetime or date-only (YYYY-MM-DD) when allDay */
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  notes?: string;
}

async function assertDoctorInClinic(
  supabase: Awaited<ReturnType<typeof requireClinicSession>>["supabase"],
  clinicId: string,
  doctorId: string
) {
  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("id")
    .eq("id", doctorId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Dokter tidak ditemukan di klinik Anda.");
  }
}

function parseBounds(input: DoctorTimeOffInput): { startsAt: string; endsAt: string } {
  if (input.allDay) {
    const startDay = input.startsAt.slice(0, 10);
    const endDay = input.endsAt.slice(0, 10);
    const start = new Date(`${startDay}T00:00:00+07:00`);
    const endExclusive = new Date(`${endDay}T00:00:00+07:00`);
    endExclusive.setDate(endExclusive.getDate() + 1);
    return {
      startsAt: start.toISOString(),
      endsAt: endExclusive.toISOString(),
    };
  }

  const startsAt = new Date(input.startsAt).toISOString();
  const endsAt = new Date(input.endsAt).toISOString();
  return { startsAt, endsAt };
}

async function assertNoReservationConflict(
  supabase: Awaited<ReturnType<typeof requireClinicSession>>["supabase"],
  doctorId: string,
  startsAt: string,
  endsAt: string,
  excludeScheduleId?: string
) {
  if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    throw new Error("Waktu selesai harus setelah waktu mulai.");
  }

  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select("id")
    .eq("doctor_id", doctorId)
    .in("status", ["pending", "confirmed", "in_progress"])
    .lt("scheduled_start_at", endsAt)
    .gt("scheduled_end_at", startsAt);

  if (bookingError) throw bookingError;
  if ((bookings ?? []).length > 0) {
    throw new Error(
      "Rentang libur bentrok dengan booking aktif. Pilih waktu lain."
    );
  }

  const { data: consultations, error: consultationError } = await supabase
    .from("consultations")
    .select("id")
    .eq("doctor_id", doctorId)
    .in("status", ["pending_payment", "scheduled", "in_progress"])
    .lt("scheduled_start_at", endsAt)
    .gt("scheduled_end_at", startsAt);

  if (consultationError) throw consultationError;
  if ((consultations ?? []).length > 0) {
    throw new Error(
      "Rentang libur bentrok dengan konsultasi aktif. Pilih waktu lain."
    );
  }

  let scheduleQuery = supabase
    .from("doctor_schedules")
    .select("id")
    .eq("doctor_id", doctorId)
    .or("booking_id.not.is.null,consultation_id.not.is.null")
    .lt("starts_at", endsAt)
    .gt("ends_at", startsAt);

  if (excludeScheduleId) {
    scheduleQuery = scheduleQuery.neq("id", excludeScheduleId);
  }

  const { data: reservedSlots, error: scheduleError } = await scheduleQuery;
  if (scheduleError) throw scheduleError;
  if ((reservedSlots ?? []).length > 0) {
    throw new Error(
      "Rentang libur bentrok dengan jadwal booking/konsultasi yang sudah ada."
    );
  }
}

async function getTimeOffRow(
  supabase: Awaited<ReturnType<typeof requireClinicSession>>["supabase"],
  clinicId: string,
  scheduleId: string
) {
  const { data, error } = await supabase
    .from("doctor_schedules")
    .select(
      `
      id,
      doctor_id,
      starts_at,
      ends_at,
      notes,
      booking_id,
      consultation_id,
      doctor_profiles!inner ( clinic_id )
    `
    )
    .eq("id", scheduleId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Jadwal libur tidak ditemukan.");

  const row = data as Record<string, unknown>;
  const doctorProfiles = row.doctor_profiles as
    | { clinic_id: string }
    | { clinic_id: string }[];
  const profile = Array.isArray(doctorProfiles)
    ? doctorProfiles[0]
    : doctorProfiles;

  if (profile?.clinic_id !== clinicId) {
    throw new Error("Akses ditolak.");
  }

  if (row.booking_id || row.consultation_id) {
    throw new Error("Hanya jadwal libur manual yang dapat diubah/dihapus.");
  }

  return row;
}

export async function createDoctorTimeOff(input: DoctorTimeOffInput) {
  const { supabase, clinicId } = await requireClinicSession();
  await assertDoctorInClinic(supabase, clinicId, input.doctorId);

  const { startsAt, endsAt } = parseBounds(input);
  await assertNoReservationConflict(
    supabase,
    input.doctorId,
    startsAt,
    endsAt
  );

  const { data, error } = await supabase
    .from("doctor_schedules")
    .insert({
      doctor_id: input.doctorId,
      starts_at: startsAt,
      ends_at: endsAt,
      notes: input.notes?.trim() || "Hari libur",
      booking_id: null,
      consultation_id: null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id as string };
}

export async function updateDoctorTimeOff(
  scheduleId: string,
  input: Omit<DoctorTimeOffInput, "doctorId">
) {
  const { supabase, clinicId } = await requireClinicSession();
  const row = await getTimeOffRow(supabase, clinicId, scheduleId);
  const doctorId = row.doctor_id as string;

  const { startsAt, endsAt } = parseBounds({
    doctorId,
    ...input,
  });
  await assertNoReservationConflict(
    supabase,
    doctorId,
    startsAt,
    endsAt,
    scheduleId
  );

  const { error } = await supabase
    .from("doctor_schedules")
    .update({
      starts_at: startsAt,
      ends_at: endsAt,
      notes: input.notes?.trim() || "Hari libur",
    })
    .eq("id", scheduleId);

  if (error) throw error;
  return { ok: true };
}

export async function deleteDoctorTimeOff(scheduleId: string) {
  const { supabase, clinicId } = await requireClinicSession();
  await getTimeOffRow(supabase, clinicId, scheduleId);

  const { error } = await supabase
    .from("doctor_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) throw error;
  return { ok: true };
}
