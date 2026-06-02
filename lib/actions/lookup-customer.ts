"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireClinicSession } from "./auth-guard";

export interface CustomerLookupResult {
  customerId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export async function lookupCustomerByEmail(
  email: string
): Promise<CustomerLookupResult | null> {
  await requireClinicSession();
  const admin = createAdminClient();

  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  let page = 1;
  const perPage = 200;
  let foundUser: { id: string; email?: string; phone?: string; user_metadata?: Record<string, unknown> } | null = null;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email?.toLowerCase() === normalized) {
        foundUser = u;
        break;
      }
    }
    if (foundUser || data.users.length < perPage) break;
    page += 1;
  }

  if (!foundUser) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, name, role")
    .eq("id", foundUser.id)
    .maybeSingle();

  if (!profile || profile.role !== "customer") return null;

  const { data: customerProfile } = await admin
    .from("customer_profiles")
    .select("address")
    .eq("id", foundUser.id)
    .maybeSingle();

  const meta = foundUser.user_metadata ?? {};
  return {
    customerId: foundUser.id,
    name: profile.name,
    email: foundUser.email ?? null,
    phone:
      (typeof meta.phone === "string" ? meta.phone : null) ??
      foundUser.phone ??
      null,
    address: customerProfile?.address ?? null,
  };
}

export async function getCustomerContact(customerId: string) {
  await requireClinicSession();
  const admin = createAdminClient();
  const { data: userData, error } = await admin.auth.admin.getUserById(
    customerId
  );
  if (error || !userData.user) return { email: null, phone: null };
  const meta = userData.user.user_metadata ?? {};
  return {
    email: userData.user.email ?? null,
    phone:
      (typeof meta.phone === "string" ? meta.phone : null) ??
      userData.user.phone ??
      null,
  };
}
