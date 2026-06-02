"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireClinicSession } from "./auth-guard";

export interface InviteDoctorInput {
  email: string;
  password: string;
  name: string;
  specialization: string;
  bio?: string;
  licenseNumber?: string;
  consultationFee?: number;
  isActive: boolean;
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

  await admin.from("profiles").upsert({
    id: userId,
    name: input.name.trim(),
    role: "doctor",
    is_active: true,
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
  isActive?: boolean;
  consultationFee?: number;
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

  if (input.name) {
    await admin
      .from("profiles")
      .update({ name: input.name.trim() })
      .eq("id", input.doctorId);
  }

  await admin
    .from("doctor_profiles")
    .update({
      specialization: input.specialization?.trim(),
      bio: input.bio?.trim(),
      is_active: input.isActive,
      consultation_fee: input.consultationFee,
    })
    .eq("id", input.doctorId);

  return { ok: true };
}
