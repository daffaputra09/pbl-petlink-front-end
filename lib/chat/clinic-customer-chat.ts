import { createClient } from "@/lib/supabase/client";

/** Thread `type: chat` antara klinik (clinic profile id) dan customer. */
export async function findOrCreateClinicCustomerThread(
  clinicId: string,
  customerId: string
): Promise<string> {
  const supabase = createClient();

  const { data: existing, error: findError } = await supabase
    .from("chat_threads")
    .select("id, is_active")
    .eq("type", "chat")
    .or(
      `and(user_1_id.eq.${clinicId},user_2_id.eq.${customerId}),` +
        `and(user_1_id.eq.${customerId},user_2_id.eq.${clinicId})`
    )
    .maybeSingle();

  if (findError) throw findError;

  if (existing?.id) {
    if (existing.is_active === false) {
      const { error: reactivateError } = await supabase
        .from("chat_threads")
        .update({ is_active: true })
        .eq("id", existing.id);
      if (reactivateError) throw reactivateError;
    }
    return existing.id as string;
  }

  const { data: created, error: createError } = await supabase
    .from("chat_threads")
    .insert({
      user_1_id: clinicId,
      user_2_id: customerId,
      type: "chat",
      is_active: true,
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}
