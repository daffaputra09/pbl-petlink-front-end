"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireClinicSession } from "./auth-guard";

export interface ProvisionCustomerInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  petName: string;
  petTypeName: string;
  breed?: string;
  sex: "male" | "female";
  birthMonth: number;
  birthYear: number;
}

export async function provisionCustomerWithPet(
  input: ProvisionCustomerInput
): Promise<{ customerId: string; petId: string }> {
  await requireClinicSession();
  const admin = createAdminClient();
  const email = input.email.trim().toLowerCase();

  let userId: string;

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        name: input.name.trim(),
        phone: input.phone?.trim() ?? "",
        role: "customer",
      },
    });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      let page = 1;
      let found: string | null = null;
      for (;;) {
        const { data } = await admin.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        for (const u of data.users) {
          if (u.email?.toLowerCase() === email) {
            found = u.id;
            break;
          }
        }
        if (found || data.users.length < 200) break;
        page += 1;
      }
      if (!found) throw createError;
      userId = found;
    } else {
      throw createError;
    }
  } else {
    userId = created.user.id;
  }

  await admin.from("profiles").upsert({
    id: userId,
    name: input.name.trim(),
    role: "customer",
    is_active: true,
  });

  await admin.from("customer_profiles").upsert({
    id: userId,
    address: input.address?.trim() || null,
  });

  const { data: petType } = await admin
    .from("pet_types")
    .select("id")
    .ilike("name", input.petTypeName.trim())
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (!petType) {
    throw new Error(`Jenis hewan "${input.petTypeName}" tidak ditemukan.`);
  }

  const { data: existingPet } = await admin
    .from("customer_pets")
    .select("id")
    .eq("customer_id", userId)
    .eq("name", input.petName.trim())
    .is("deleted_at", null)
    .maybeSingle();

  let petId: string;
  if (existingPet) {
    petId = existingPet.id;
    await admin
      .from("customer_pets")
      .update({
        breed: input.breed?.trim() || null,
        sex: input.sex,
        birth_month: input.birthMonth,
        birth_year: input.birthYear,
        pet_type_id: petType.id,
      })
      .eq("id", petId);
  } else {
    const { data: newPet, error: petError } = await admin
      .from("customer_pets")
      .insert({
        customer_id: userId,
        pet_type_id: petType.id,
        name: input.petName.trim(),
        breed: input.breed?.trim() || null,
        sex: input.sex,
        birth_month: input.birthMonth,
        birth_year: input.birthYear,
      })
      .select("id")
      .single();
    if (petError) throw petError;
    petId = newPet.id;
  }

  return { customerId: userId, petId };
}
