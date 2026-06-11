import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCustomerNamesById } from "@/lib/booking/fetch-customer-names";
import { fetchPaymentDetailsByBookingId } from "@/lib/booking/fetch-payment-details";
import { dbStatusFromUiFilter } from "@/lib/booking/display-status";
import {
  BOOKING_LIST_SELECT,
  mapBookingRow,
} from "@/lib/booking/mappers";
import type { Booking, BookingStatus } from "@/types/booking";

export const BOOKINGS_PAGE_SIZE = 20;
export const BOOKINGS_SEARCH_LIMIT = 200;

type StatusFilter = BookingStatus | "Semua";

export interface FetchBookingsPageOptions {
  from: number;
  to: number;
  statusFilter?: StatusFilter;
  dateFilter?: string;
  /** Tanpa range — ambil N terbaru untuk pencarian client-side. */
  searchLimit?: number;
}

export async function mapBookingRows(
  supabase: SupabaseClient,
  clinicId: string,
  rows: Record<string, unknown>[]
): Promise<Booking[]> {
  if (rows.length === 0) return [];

  const bookingIds = rows.map((r) => r.id as string);
  const customerIds = rows.map((r) => r.customer_id as string);

  const [paymentByBooking, nameByCustomer] = await Promise.all([
    fetchPaymentDetailsByBookingId(supabase, bookingIds, clinicId),
    fetchCustomerNamesById(supabase, customerIds),
  ]);

  return rows.map((row) => {
    const customerId = row.customer_id as string;
    const bookingId = row.id as string;
    const payment = paymentByBooking[bookingId];
    const booking = mapBookingRow(row as Parameters<typeof mapBookingRow>[0], {
      ownerName: nameByCustomer[customerId],
      paymentStatus: payment?.status ?? null,
      paymentAmount: payment?.amount ?? null,
      paidAt: payment?.paidAt ?? null,
      paymentMethod: payment?.paymentMethod ?? null,
      midtransOrderId: payment?.midtransOrderId ?? null,
    });
    booking.customerId = customerId;
    return booking;
  });
}

export async function fetchClinicBookingsPage(
  supabase: SupabaseClient,
  clinicId: string,
  options: FetchBookingsPageOptions
): Promise<{ bookings: Booking[]; totalCount: number }> {
  const statusFilter = options.statusFilter ?? "Semua";

  let query = supabase
    .from("bookings")
    .select(BOOKING_LIST_SELECT, { count: "exact" })
    .eq("clinic_id", clinicId)
    .order("scheduled_start_at", { ascending: false });

  if (statusFilter !== "Semua") {
    const statuses = dbStatusFromUiFilter(statusFilter);
    query = query.in("status", statuses);
  }

  if (options.dateFilter) {
    const start = new Date(`${options.dateFilter}T00:00:00`);
    const end = new Date(`${options.dateFilter}T23:59:59.999`);
    query = query
      .gte("scheduled_start_at", start.toISOString())
      .lt("scheduled_start_at", end.toISOString());
  }

  if (options.searchLimit != null) {
    query = query.limit(options.searchLimit);
  } else {
    query = query.range(options.from, options.to);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const bookings = await mapBookingRows(
    supabase,
    clinicId,
    (data ?? []) as Record<string, unknown>[]
  );

  return {
    bookings,
    totalCount: count ?? bookings.length,
  };
}
