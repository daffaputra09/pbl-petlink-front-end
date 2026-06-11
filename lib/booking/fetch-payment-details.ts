import type { SupabaseClient } from "@supabase/supabase-js";

export interface BookingPaymentInfo {
  status: string;
  amount: number;
  paidAt: string | null;
  paymentMethod: string | null;
  midtransOrderId: string | null;
}

/** Payments link via reference_type + reference_id. */
export async function fetchPaymentDetailsByReference(
  supabase: SupabaseClient,
  referenceType: "booking" | "consultation",
  referenceIds: string[],
  clinicId: string
): Promise<Record<string, BookingPaymentInfo>> {
  if (referenceIds.length === 0) return {};

  const { data, error } = await supabase
    .from("payments")
    .select(
      "reference_id, status, amount, paid_at, payment_method, midtrans_order_id"
    )
    .eq("reference_type", referenceType)
    .eq("clinic_id", clinicId)
    .in("reference_id", referenceIds);

  if (error) throw error;

  const out: Record<string, BookingPaymentInfo> = {};
  for (const row of data ?? []) {
    if (!row.reference_id) continue;
    const amount =
      typeof row.amount === "number"
        ? row.amount
        : Number.parseFloat(String(row.amount ?? 0)) || 0;
    out[row.reference_id] = {
      status: row.status as string,
      amount,
      paidAt: (row.paid_at as string | null) ?? null,
      paymentMethod: (row.payment_method as string | null) ?? null,
      midtransOrderId: (row.midtrans_order_id as string | null) ?? null,
    };
  }
  return out;
}

/** Payments link to bookings via reference_type + reference_id. */
export async function fetchPaymentDetailsByBookingId(
  supabase: SupabaseClient,
  bookingIds: string[],
  clinicId: string
): Promise<Record<string, BookingPaymentInfo>> {
  return fetchPaymentDetailsByReference(
    supabase,
    "booking",
    bookingIds,
    clinicId
  );
}
