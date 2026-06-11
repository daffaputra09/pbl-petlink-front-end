"use client";

import type { ReviewStats } from "@/types/review";
import StarRatingDisplay from "./StarRatingDisplay";

interface ReviewStatsCardsProps {
  stats: ReviewStats | null;
  loading?: boolean;
}

export default function ReviewStatsCards({
  stats,
  loading = false,
}: ReviewStatsCardsProps) {
  const breakdown = stats?.breakdown ?? {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  };
  const total = stats?.totalReviews ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-[#1E6B4F] text-white rounded-2xl p-5 flex flex-col gap-3">
        <span className="text-sm font-medium text-white/70">Rating Rata-rata</span>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-bold tracking-tight">
            {loading ? "—" : stats?.averageRating.toFixed(1) ?? "0.0"}
          </p>
          {!loading && stats ? (
            <StarRatingDisplay rating={stats.averageRating} size={18} />
          ) : null}
        </div>
        <p className="text-xs text-white/70">
          {loading ? "Memuat statistik..." : `${total} total ulasan`}
        </p>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-500 mb-3">Distribusi Rating</p>
        <div className="space-y-2">
          {(["5", "4", "3", "2", "1"] as const).map((key) => {
            const count = breakdown[key];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-10 text-xs font-medium text-gray-500">
                  {key} ★
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-xs text-gray-500 text-right">
                  {loading ? "—" : `${count} (${pct}%)`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
