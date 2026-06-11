"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareQuote, Star } from "lucide-react";
import { AdminPageSearch } from "@/components/layout/AdminPageSearch";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewStatsCards from "@/components/reviews/ReviewStatsCards";
import { KlinikFilterTabs } from "@/components/klinik/KlinikPageLayout";
import {
  ratingFilterToTab,
  ratingTabToFilter,
} from "@/components/reviews/ReviewFilterBar";
import { useAdminReviews } from "@/hooks/use-admin-reviews";
import {
  fetchAdminReviewClinicOptions,
  fetchAdminReviewStats,
} from "@/lib/actions/admin-reviews";
import type { ReviewRatingFilter, ReviewStats } from "@/types/review";

export default function AdminUlasanPage() {
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [clinicOptions, setClinicOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const {
    items,
    loading,
    loadingMore,
    error,
    total,
    hasMore,
    loadMore,
    isSearchMode,
  } = useAdminReviews({
    ratingFilter,
    clinicId: clinicId || null,
    search: searchQuery,
  });

  useEffect(() => {
    let cancelled = false;
    void fetchAdminReviewClinicOptions()
      .then((options) => {
        if (!cancelled) setClinicOptions(options);
      })
      .catch(() => {
        if (!cancelled) setClinicOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    void fetchAdminReviewStats({ clinicId: clinicId || null })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  const listDescription = useMemo(() => {
    if (loading) return "Memuat ulasan...";
    if (isSearchMode) return `${items.length} hasil pencarian`;
    return `${items.length} dari ${total} ulasan`;
  }, [isSearchMode, items.length, loading, total]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    ratingFilter !== "Semua" ||
    clinicId.length > 0;

  function resetFilters() {
    setSearchQuery("");
    setRatingFilter("Semua");
    setClinicId("");
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ulasan & Rating</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tinjau rating dan ulasan customer untuk seluruh klinik.
          </p>
        </div>
        <AdminPageSearch
          placeholder="Cari customer, klinik, komentar..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-gray-600 shrink-0">
            Filter klinik
          </label>
          <select
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            className="w-full sm:max-w-xs h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Semua klinik</option>
            {clinicOptions.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Reset filter
            </button>
          ) : null}
        </div>

        <ReviewStatsCards stats={stats} loading={statsLoading} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 mr-1">
              <Star size={13} />
              Rating
            </span>
            <KlinikFilterTabs
              tabs={["Semua", "5 ★", "4 ★", "3 ★", "2 ★", "1 ★"]}
              active={ratingFilterToTab(ratingFilter)}
              onChange={(tab) => setRatingFilter(ratingTabToFilter(tab))}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Daftar Ulasan
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{listDescription}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <MessageSquareQuote size={14} />
              Semua klinik
            </span>
          </div>

          <ReviewList
            items={items}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore && !isSearchMode}
            onLoadMore={loadMore}
            searchQuery={searchQuery}
            showClinic
          />
        </div>
      </div>
    </div>
  );
}
