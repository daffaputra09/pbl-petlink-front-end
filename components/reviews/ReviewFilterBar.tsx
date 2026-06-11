"use client";

import { RotateCcw, Search, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KlinikFilterTabs } from "@/components/klinik/KlinikPageLayout";
import type { ReviewRatingFilter } from "@/types/review";

const RATING_TAB_LABELS = [
  "Semua",
  "5 ★",
  "4 ★",
  "3 ★",
  "2 ★",
  "1 ★",
] as const;

export function ratingTabToFilter(tab: string): ReviewRatingFilter {
  if (tab === "Semua") return "Semua";
  const rating = Number.parseInt(tab, 10);
  if (rating >= 1 && rating <= 5) return rating as ReviewRatingFilter;
  return "Semua";
}

export function ratingFilterToTab(filter: ReviewRatingFilter): string {
  return filter === "Semua" ? "Semua" : `${filter} ★`;
}

interface ReviewFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  ratingFilter: ReviewRatingFilter;
  onRatingChange: (value: ReviewRatingFilter) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function ReviewFilterBar({
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingChange,
  onReset,
  hasActiveFilters,
}: ReviewFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama customer, hewan, komentar, atau ID booking..."
            className="pl-9 pr-9 h-10 rounded-xl border-gray-200"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 bg-white shrink-0"
          >
            <RotateCcw size={14} />
            Reset filter
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 mr-1">
          <Star size={13} />
          Rating
        </span>
        <KlinikFilterTabs
          tabs={RATING_TAB_LABELS}
          active={ratingFilterToTab(ratingFilter)}
          onChange={(tab) => onRatingChange(ratingTabToFilter(tab))}
        />
      </div>
    </div>
  );
}
