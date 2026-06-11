"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireClinicSession } from "./auth-guard";
import type { Doctor, DoctorScheduleEntry } from "@/types/dokter";

const DOCTOR_SELECT = `
  id,
  bio,
  specialization,
  license_number,
  consultation_fee,
  is_active,
  clinic_id,
  profiles ( name, image_url )
`;

function mapDoctorRow(
  row: Record<string, unknown>,
  email: string
): Doctor {
  const profiles = row.profiles;
  const profile = Array.isArray(profiles)
    ? (profiles[0] as Record<string, unknown> | undefined)
    : (profiles as Record<string, unknown> | undefined);

  const isActive = (row.is_active as boolean) ?? true;
  const feeRaw = row.consultation_fee;
  const consultationFee =
    typeof feeRaw === "number"
      ? feeRaw
      : Number.parseFloat(String(feeRaw ?? 0)) || 0;

  return {
    id: row.id as string,
    nama: (profile?.name as string) ?? "Dokter",
    email,
    spesialisasi: (row.specialization as string)?.trim() || "General Praktek",
    bio: (row.bio as string | null) ?? null,
    licenseNumber: (row.license_number as string | null) ?? null,
    consultationFee,
    isActive,
    status: isActive ? "Aktif" : "Nonaktif",
    photo: (profile?.image_url as string | undefined) ?? undefined,
  };
}

async function uploadDoctorPhoto(
  admin: ReturnType<typeof createAdminClient>,
  doctorId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${doctorId}/profile.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("petlink_bucket")
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = admin.storage
    .from("petlink_bucket")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export interface InviteDoctorInput {
  email: string;
  password: string;
  name: string;
  specialization: string;
  bio?: string;
  licenseNumber?: string;
  consultationFee?: number;
  isActive: boolean;
  photoFile?: File | null;
}

export async function listClinicDoctors(): Promise<Doctor[]> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("doctor_profiles")
    .select(DOCTOR_SELECT)
    .eq("clinic_id", clinicId)
    .order("id");

  if (error) throw error;

  const rows = data ?? [];
  const doctors: Doctor[] = [];

  for (const row of rows) {
    const map = row as Record<string, unknown>;
    const id = map.id as string;
    let email = "";
    try {
      const { data: userData } = await admin.auth.admin.getUserById(id);
      email = userData.user?.email ?? "";
    } catch {
      email = "";
    }
    doctors.push(mapDoctorRow(map, email));
  }

  return doctors;
}

export async function listClinicDoctorBookedSchedules(): Promise<
  DoctorScheduleEntry[]
> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const { data: doctors, error: doctorsError } = await admin
    .from("doctor_profiles")
    .select("id")
    .eq("clinic_id", clinicId);

  if (doctorsError) throw doctorsError;

  const doctorIds = (doctors ?? []).map((d) => d.id as string);
  if (doctorIds.length === 0) return [];

  const { data, error } = await admin
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
    .in("doctor_id", doctorIds)
    .order("starts_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const map = row as Record<string, unknown>;
    const booking = map.bookings as Record<string, unknown> | null;
    const consultation = map.consultations as Record<string, unknown> | null;
    const bookingId = map.booking_id as string | null;
    const consultationId = map.consultation_id as string | null;

    let kind: DoctorScheduleEntry["kind"] = "unknown";
    let referenceStatus: string | null = null;
    let referenceTitle = "Blok waktu";
    let referenceSubtitle: string | null = null;
    let referenceLabel = "Blok waktu";

    const profileName = (
      join: Record<string, unknown> | null | undefined
    ): string | null => {
      if (!join) return null;
      const profiles = join.profiles;
      const profile = Array.isArray(profiles)
        ? (profiles[0] as Record<string, unknown> | undefined)
        : (profiles as Record<string, unknown> | undefined);
      return (profile?.name as string | undefined)?.trim() || null;
    };

    if (bookingId) {
      kind = "booking";
      referenceStatus = (booking?.status as string) ?? null;
      const channel =
        booking?.channel === "home" ? "Home Service" : "Kunjungan Klinik";
      const petJoin = booking?.customer_pets;
      const pet = Array.isArray(petJoin)
        ? (petJoin[0] as Record<string, unknown> | undefined)
        : (petJoin as Record<string, unknown> | undefined);
      const petName = (pet?.name as string | undefined)?.trim();
      const customerName = profileName(
        booking?.customer_profiles as Record<string, unknown> | undefined
      );
      referenceTitle =
        petName && customerName
          ? `${petName} · ${customerName}`
          : petName || customerName || "Booking";
      referenceSubtitle = channel;
      referenceLabel = `${referenceTitle} · ${channel}`;
    } else if (consultationId) {
      kind = "consultation";
      referenceStatus = (consultation?.status as string) ?? null;
      const customerName = profileName(
        consultation?.customer_profiles as Record<string, unknown> | undefined
      );
      referenceTitle = customerName || "Konsultasi";
      referenceSubtitle = "Konsultasi Online";
      referenceLabel = referenceSubtitle;
    } else {
      kind = "time_off";
      referenceTitle = (map.notes as string)?.trim() || "Hari libur";
      referenceSubtitle = null;
      referenceLabel = referenceTitle;
    }

    return {
      id: map.id as string,
      doctorId: map.doctor_id as string,
      startsAt: map.starts_at as string,
      endsAt: map.ends_at as string,
      notes: (map.notes as string | null) ?? null,
      bookingId,
      consultationId,
      kind,
      referenceStatus,
      referenceTitle,
      referenceSubtitle,
      referenceLabel,
    };
  });
}

export async function inviteDoctor(
  input: InviteDoctorInput
): Promise<{ doctorId: string }> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const email = input.email.trim().toLowerCase();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name: input.name.trim(), role: "doctor" },
    });

  if (createError) throw createError;
  const userId = created.user.id;

  let imageUrl: string | null = null;
  if (input.photoFile) {
    imageUrl = await uploadDoctorPhoto(admin, userId, input.photoFile);
  }

  await admin.from("profiles").upsert({
    id: userId,
    name: input.name.trim(),
    role: "doctor",
    is_active: true,
    image_url: imageUrl,
  });

  const { error: doctorError } = await admin.from("doctor_profiles").upsert({
    id: userId,
    clinic_id: clinicId,
    bio: input.bio?.trim() || null,
    specialization: input.specialization.trim(),
    license_number: input.licenseNumber?.trim() || null,
    consultation_fee: input.consultationFee ?? 0,
    is_active: input.isActive,
  });

  if (doctorError) throw doctorError;

  return { doctorId: userId };
}

export async function updateDoctorProfile(input: {
  doctorId: string;
  name?: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
  isActive?: boolean;
  consultationFee?: number;
  photoFile?: File | null;
}) {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const { data: doc } = await admin
    .from("doctor_profiles")
    .select("id")
    .eq("id", input.doctorId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (!doc) throw new Error("Dokter tidak ditemukan.");

  if (input.name?.trim()) {
    await admin
      .from("profiles")
      .update({ name: input.name.trim() })
      .eq("id", input.doctorId);
  }

  if (input.photoFile) {
    const imageUrl = await uploadDoctorPhoto(
      admin,
      input.doctorId,
      input.photoFile
    );
    await admin
      .from("profiles")
      .update({ image_url: imageUrl })
      .eq("id", input.doctorId);
  }

  const doctorPatch: Record<string, unknown> = {};
  if (input.specialization !== undefined) {
    doctorPatch.specialization = input.specialization.trim();
  }
  if (input.bio !== undefined) {
    doctorPatch.bio = input.bio.trim() || null;
  }
  if (input.licenseNumber !== undefined) {
    doctorPatch.license_number = input.licenseNumber.trim() || null;
  }
  if (input.isActive !== undefined) {
    doctorPatch.is_active = input.isActive;
  }
  if (input.consultationFee !== undefined) {
    doctorPatch.consultation_fee = input.consultationFee;
  }

  if (Object.keys(doctorPatch).length > 0) {
    const { error } = await admin
      .from("doctor_profiles")
      .update(doctorPatch)
      .eq("id", input.doctorId);

    if (error) throw error;
  }

  if (input.isActive !== undefined) {
    await admin
      .from("profiles")
      .update({ is_active: input.isActive })
      .eq("id", input.doctorId);
  }

  return { ok: true };
}
