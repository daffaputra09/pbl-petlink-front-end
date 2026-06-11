"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildReviewBreakdown,
  mapAdminReviewRow,
  type ReviewRow,
} from "@/lib/reviews/map-review-row";
import type {
  AdminReviewItem,
  ReviewRatingFilter,
  ReviewStats,
} from "@/types/review";
import { requireAdminSession } from "./auth-guard";

const PAGE_SIZE = 20;

const ADMIN_REVIEW_SELECT = `
  id,
  rating,
  comment,
  created_at,
  booking_id,
  clinic_id,
  profiles!clinic_reviews_user_id_fkey (
    name
  ),
  bookings (
    scheduled_start_at,
    customer_pets ( name )
  ),
  clinic_profiles (
    profiles ( name )
  )
`;

async function fetchGlobalRatingBreakdown(
  admin: ReturnType<typeof createAdminClient>,
  clinicId?: string | null
): Promise<ReviewStats["breakdown"]> {
  const counts = await Promise.all(
    ([1, 2, 3, 4, 5] as const).map(async (rating) => {
      let query = admin
        .from("clinic_reviews")
        .select("*", { count: "exact", head: true })
        .eq("rating", rating);
      if (clinicId) query = query.eq("clinic_id", clinicId);
      const { count, error } = await query;
      if (error) throw error;
      return { rating, count: count ?? 0 };
    })
  );
  return buildReviewBreakdown(counts);
}

export async function fetchAdminReviewStats(options?: {
  clinicId?: string | null;
}): Promise<ReviewStats> {
  await requireAdminSession();
  const admin = createAdminClient();
  const clinicId = options?.clinicId?.trim() || null;

  if (clinicId) {
    const [{ data: profile, error: profileError }, breakdown] =
      await Promise.all([
        admin
          .from("clinic_profiles")
          .select("average_rating, total_reviews")
          .eq("id", clinicId)
          .maybeSingle(),
        fetchGlobalRatingBreakdown(admin, clinicId),
      ]);
    if (profileError) throw profileError;

    return {
      averageRating: Number((profile?.average_rating ?? 0).toFixed(2)),
      totalReviews: profile?.total_reviews ?? 0,
      breakdown,
    };
  }

  const [{ data: clinics, error: clinicsError }, breakdown] = await Promise.all([
    admin.from("clinic_profiles").select("average_rating, total_reviews"),
    fetchGlobalRatingBreakdown(admin),
  ]);
  if (clinicsError) throw clinicsError;

  let weightedSum = 0;
  let totalReviews = 0;
  for (const clinic of clinics ?? []) {
    const count = clinic.total_reviews ?? 0;
    totalReviews += count;
    weightedSum += (clinic.average_rating ?? 0) * count;
  }

  return {
    averageRating: totalReviews
      ? Number((weightedSum / totalReviews).toFixed(2))
      : 0,
    totalReviews,
    breakdown,
  };
}

export async function fetchAdminReviewsPage(options: {
  page?: number;
  pageSize?: number;
  ratingFilter?: ReviewRatingFilter;
  clinicId?: string | null;
}): Promise<{ items: AdminReviewItem[]; total: number }> {
  await requireAdminSession();
  const admin = createAdminClient();
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const clinicId = options.clinicId?.trim() || null;

  let query = admin
    .from("clinic_reviews")
    .select(ADMIN_REVIEW_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (clinicId) query = query.eq("clinic_id", clinicId);
  if (options.ratingFilter && options.ratingFilter !== "Semua") {
    query = query.eq("rating", options.ratingFilter);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const items = (data ?? []).map((row) => mapAdminReviewRow(row as ReviewRow));

  return { items, total: count ?? items.length };
}

export async function searchAdminReviews(options: {
  ratingFilter?: ReviewRatingFilter;
  clinicId?: string | null;
  limit?: number;
}): Promise<AdminReviewItem[]> {
  await requireAdminSession();
  const admin = createAdminClient();
  const limit = options.limit ?? 500;
  const clinicId = options.clinicId?.trim() || null;

  let query = admin
    .from("clinic_reviews")
    .select(ADMIN_REVIEW_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (clinicId) query = query.eq("clinic_id", clinicId);
  if (options.ratingFilter && options.ratingFilter !== "Semua") {
    query = query.eq("rating", options.ratingFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => mapAdminReviewRow(row as ReviewRow));
}

export async function fetchAdminReviewClinicOptions(): Promise<
  { id: string; name: string }[]
> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("clinic_profiles")
    .select("id, profiles ( name )")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const map = row as {
      id: string;
      profiles?: { name?: string | null } | { name?: string | null }[] | null;
    };
    const profile = Array.isArray(map.profiles)
      ? map.profiles[0]
      : map.profiles;
    return {
      id: map.id,
      name: profile?.name?.trim() || "Klinik",
    };
  });
}
