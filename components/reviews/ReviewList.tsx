"use client";

import { CalendarDays, Loader2, MessageSquareQuote, PawPrint, User } from "lucide-react";
import { formatBookingRef, formatTanggalIndo } from "@/lib/booking/format";
import type { AdminReviewItem, ClinicReviewItem } from "@/types/review";
import StarRatingDisplay from "./StarRatingDisplay";

interface ReviewListProps {
  items: ClinicReviewItem[] | AdminReviewItem[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  searchQuery?: string;
  showClinic?: boolean;
}

function isAdminReview(
  item: ClinicReviewItem | AdminReviewItem
): item is AdminReviewItem {
  return "clinicName" in item;
}

export default function ReviewList({
  items,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  searchQuery = "",
  showClinic = false,
}: ReviewListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-6">
        <MessageSquareQuote size={40} className="mb-3 opacity-50" />
        <p className="text-sm font-medium text-gray-500">
          {searchQuery.trim()
            ? "Tidak ada ulasan yang cocok dengan pencarian."
            : "Belum ada ulasan."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <article key={item.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StarRatingDisplay rating={item.rating} />
                {showClinic && isAdminReview(item) ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-0.5">
                    {item.clinicName}
                  </span>
                ) : null}
              </div>

              {item.comment ? (
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {item.comment}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">Tanpa komentar</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <User size={13} />
                  {item.reviewerName}
                </span>
                {item.petName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <PawPrint size={13} />
                    {item.petName}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  Booking #{formatBookingRef(item.bookingId)}
                  {item.bookingDate
                    ? ` · ${formatTanggalIndo(item.bookingDate)}`
                    : ""}
                </span>
              </div>
            </div>

            <time
              dateTime={item.createdAt}
              className="text-xs text-gray-400 shrink-0"
            >
              {formatTanggalIndo(item.createdAt)}
            </time>
          </div>
        </article>
      ))}

      {hasMore && onLoadMore ? (
        <div className="px-5 py-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memuat...
              </>
            ) : (
              "Muat lebih banyak"
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
