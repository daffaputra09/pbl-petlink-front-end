import type { AdminReviewItem, ClinicReviewItem, ReviewStats } from "@/types/review";

type ProfileJoin = { name?: string | null } | { name?: string | null }[] | null;

type BookingJoin = {
  scheduled_start_at?: string | null;
  customer_pets?:
    | { name?: string | null }
    | { name?: string | null }[]
    | null;
} | null;

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  booking_id: string;
  clinic_id?: string;
  profiles?: ProfileJoin;
  bookings?: BookingJoin;
  clinic_profiles?: {
    profiles?: ProfileJoin;
  } | null;
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function profileName(join: ProfileJoin | undefined): string {
  const profile = first(join);
  return profile?.name?.trim() || "Customer";
}

export function mapClinicReviewRow(row: ReviewRow): ClinicReviewItem {
  const booking = first(row.bookings ?? null);
  const pet = first(booking?.customer_pets ?? null);

  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment?.trim() || null,
    createdAt: row.created_at,
    bookingId: row.booking_id,
    reviewerName: profileName(row.profiles),
    petName: pet?.name?.trim() || null,
    bookingDate: booking?.scheduled_start_at ?? null,
  };
}

export function mapAdminReviewRow(row: ReviewRow): AdminReviewItem {
  const base = mapClinicReviewRow(row);
  const clinicProfile = first(row.clinic_profiles?.profiles ?? null);

  return {
    ...base,
    clinicId: row.clinic_id ?? "",
    clinicName: clinicProfile?.name?.trim() || "Klinik",
  };
}

export function emptyReviewBreakdown(): ReviewStats["breakdown"] {
  return { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
}

export function buildReviewBreakdown(
  counts: { rating: number; count: number }[]
): ReviewStats["breakdown"] {
  const breakdown = emptyReviewBreakdown();
  for (const row of counts) {
    const key = String(row.rating) as keyof ReviewStats["breakdown"];
    if (key in breakdown) breakdown[key] = row.count;
  }
  return breakdown;
}
