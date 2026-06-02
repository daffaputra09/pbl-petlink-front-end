import type { SupabaseClient } from "@supabase/supabase-js";

/** Payments link to bookings via reference_type + reference_id (no direct FK embed). */
export async function fetchPaymentStatusByBookingId(
  supabase: SupabaseClient,
  bookingIds: string[],
  clinicId: string
): Promise<Record<string, string>> {
  if (bookingIds.length === 0) return {};

  const { data, error } = await supabase
    .from("payments")
    .select("reference_id, status")
    .eq("reference_type", "booking")
    .eq("clinic_id", clinicId)
    .in("reference_id", bookingIds);

  if (error) throw error;

  const out: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.reference_id && row.status) {
      out[row.reference_id] = row.status;
    }
  }
  return out;
}
