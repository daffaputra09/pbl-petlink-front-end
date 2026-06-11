"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareQuote, Star } from "lucide-react";
import ReviewFilterBar from "@/components/reviews/ReviewFilterBar";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewStatsCards from "@/components/reviews/ReviewStatsCards";
import StatCard from "@/components/keuangan/FinanceStatCard";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicReviews } from "@/hooks/use-clinic-reviews";
import { fetchClinicReviewStats } from "@/lib/actions/clinic-reviews";
import type { ReviewRatingFilter, ReviewStats } from "@/types/review";

export default function KlinikUlasanPage() {
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
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
  } = useClinicReviews({
    ratingFilter,
    search: searchQuery,
  });

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    void fetchClinicReviewStats()
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
  }, []);

  const listDescription = useMemo(() => {
    if (loading) return "Memuat ulasan...";
    if (isSearchMode) return `${items.length} hasil pencarian`;
    return `${items.length} dari ${total} ulasan`;
  }, [isSearchMode, items.length, loading, total]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || ratingFilter !== "Semua";

  function resetFilters() {
    setSearchQuery("");
    setRatingFilter("Semua");
  }

  return (
    <KlinikPageLayout
      title="Ulasan & Rating"
      description="Lihat rating dan ulasan customer untuk klinik Anda"
      maxWidth="6xl"
    >
      {error ? <KlinikPageAlert message={error} /> : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Rating Rata-rata"
          value={
            statsLoading ? "—" : (stats?.averageRating.toFixed(1) ?? "0.0")
          }
          icon={<Star size={18} />}
          highlight
        />
        <StatCard
          label="Total Ulasan"
          value={statsLoading ? "—" : String(stats?.totalReviews ?? 0)}
          icon={<MessageSquareQuote size={18} />}
        />
        <StatCard
          label="Ulasan 5 ★"
          value={
            statsLoading ? "—" : String(stats?.breakdown["5"] ?? 0)
          }
          icon={<Star size={18} />}
        />
        <StatCard
          label="Ulasan 1–2 ★"
          value={
            statsLoading
              ? "—"
              : String(
                  (stats?.breakdown["1"] ?? 0) + (stats?.breakdown["2"] ?? 0)
                )
          }
          icon={<Star size={18} />}
        />
      </div>

      <ReviewStatsCards stats={stats} loading={statsLoading} />

      <ReviewFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <KlinikSectionCard
        title="Daftar Ulasan"
        description={listDescription}
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <MessageSquareQuote size={14} />
            Customer
          </span>
        }
      >
        <ReviewList
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore && !isSearchMode}
          onLoadMore={loadMore}
          searchQuery={searchQuery}
        />
      </KlinikSectionCard>
    </KlinikPageLayout>
  );
}
