"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildReviewBreakdown,
  mapClinicReviewRow,
  type ReviewRow,
} from "@/lib/reviews/map-review-row";
import type { ClinicReviewItem, ReviewRatingFilter, ReviewStats } from "@/types/review";
import { requireClinicSession } from "./auth-guard";

const PAGE_SIZE = 20;

const CLINIC_REVIEW_SELECT = `
  id,
  rating,
  comment,
  created_at,
  booking_id,
  profiles!clinic_reviews_user_id_fkey (
    name
  ),
  bookings (
    scheduled_start_at,
    customer_pets ( name )
  )
`;

async function fetchRatingBreakdown(
  admin: ReturnType<typeof createAdminClient>,
  clinicId: string
): Promise<ReviewStats["breakdown"]> {
  const counts = await Promise.all(
    ([1, 2, 3, 4, 5] as const).map(async (rating) => {
      const { count, error } = await admin
        .from("clinic_reviews")
        .select("*", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .eq("rating", rating);
      if (error) throw error;
      return { rating, count: count ?? 0 };
    })
  );
  return buildReviewBreakdown(counts);
}

export async function fetchClinicReviewStats(): Promise<ReviewStats> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();

  const [{ data: profile, error: profileError }, breakdown] = await Promise.all([
    admin
      .from("clinic_profiles")
      .select("average_rating, total_reviews")
      .eq("id", clinicId)
      .maybeSingle(),
    fetchRatingBreakdown(admin, clinicId),
  ]);

  if (profileError) throw profileError;

  return {
    averageRating: Number((profile?.average_rating ?? 0).toFixed(2)),
    totalReviews: profile?.total_reviews ?? 0,
    breakdown,
  };
}

export async function fetchClinicReviewsPage(options: {
  page?: number;
  pageSize?: number;
  ratingFilter?: ReviewRatingFilter;
}): Promise<{ items: ClinicReviewItem[]; total: number }> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("clinic_reviews")
    .select(CLINIC_REVIEW_SELECT, { count: "exact" })
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (options.ratingFilter && options.ratingFilter !== "Semua") {
    query = query.eq("rating", options.ratingFilter);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const items = (data ?? []).map((row) =>
    mapClinicReviewRow(row as ReviewRow)
  );

  return { items, total: count ?? items.length };
}

export async function searchClinicReviews(options: {
  ratingFilter?: ReviewRatingFilter;
  limit?: number;
}): Promise<ClinicReviewItem[]> {
  const { clinicId } = await requireClinicSession();
  const admin = createAdminClient();
  const limit = options.limit ?? 500;

  let query = admin
    .from("clinic_reviews")
    .select(CLINIC_REVIEW_SELECT)
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options.ratingFilter && options.ratingFilter !== "Semua") {
    query = query.eq("rating", options.ratingFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => mapClinicReviewRow(row as ReviewRow));
}
