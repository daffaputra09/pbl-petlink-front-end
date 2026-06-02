"use server";

import { createClient } from "@/lib/supabase/server";

export async function requireClinicSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi tidak valid. Silakan masuk kembali.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "clinic") {
    throw new Error("Akses ditolak: bukan akun klinik.");
  }
  if (profile.is_active === false) {
    throw new Error("Akun klinik tidak aktif.");
  }

  return { supabase, user, clinicId: user.id, clinicName: profile.name };
}

export async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi tidak valid. Silakan masuk kembali.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Akses ditolak: bukan akun admin.");
  }
  if (profile.is_active === false) {
    throw new Error("Akun admin tidak aktif.");
  }

  return { supabase, user, adminId: user.id, adminName: profile.name };
}
