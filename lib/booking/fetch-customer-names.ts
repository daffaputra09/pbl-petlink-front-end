import type { SupabaseClient } from "@supabase/supabase-js";

/** Owner display name: profiles.id = bookings.customer_id (via customer_profiles). */
export async function fetchCustomerNamesById(
  supabase: SupabaseClient,
  customerIds: string[]
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(customerIds.filter(Boolean)));
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", unique);

  if (error) throw error;

  const out: Record<string, string> = {};
  for (const row of data ?? []) {
    out[row.id] = row.name;
  }
  return out;
}
