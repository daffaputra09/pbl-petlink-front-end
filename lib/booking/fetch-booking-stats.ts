import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPaymentDetailsByBookingId } from "@/lib/booking/fetch-payment-details";

export interface BookingStats {
  todayCount: number;
  upcoming: number;
  completed: number;
  revenue: number;
}

function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function fetchBookingStats(
  supabase: SupabaseClient,
  clinicId: string
): Promise<BookingStats> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, status, scheduled_start_at, total_amount")
    .eq("clinic_id", clinicId);

  if (error) throw error;

  const rows = data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const bookingIds = rows.map((r) => r.id as string);

  const paymentByBooking = await fetchPaymentDetailsByBookingId(
    supabase,
    bookingIds,
    clinicId
  );

  let todayCount = 0;
  let upcoming = 0;
  let completed = 0;
  let revenue = 0;

  for (const row of rows) {
    const dateKey = localDateKey(row.scheduled_start_at as string);
    const status = row.status as string;
    const uiTerjadwal = ["pending", "confirmed", "in_progress"].includes(
      status
    );

    if (dateKey === today) todayCount += 1;
    if (uiTerjadwal && dateKey >= today) upcoming += 1;
    if (status === "completed") completed += 1;

    const payment = paymentByBooking[row.id as string];
    if (payment?.status === "paid") {
      const amount =
        typeof row.total_amount === "number"
          ? row.total_amount
          : Number.parseFloat(String(row.total_amount ?? 0)) || 0;
      revenue += payment.amount > 0 ? payment.amount : amount;
    }
  }

  return { todayCount, upcoming, completed, revenue };
}
