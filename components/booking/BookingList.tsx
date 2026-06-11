"use client";

import { useEffect, useMemo, useRef } from "react";
import { Booking } from "@/types/booking";
import BookingCard from "./BookingCard";
import BookingListSkeleton from "./BookingListSkeleton";
import { formatTanggalIndo } from "@/lib/booking/format";
import { LoadingBlock } from "@/components/ui/Spinner";

type Props = {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  searchQuery?: string;
};

export default function BookingList({
  bookings,
  onSelectBooking,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  searchQuery,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const key = b.tanggal;
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [bookings]);

  useEffect(() => {
    if (!onLoadMore || !hasMore || loading || loadingMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading, loadingMore, bookings.length]);

  if (loading) {
    return <BookingListSkeleton rows={5} />;
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-3">📋</span>
        <p className="text-sm font-medium text-gray-500">
          {searchQuery?.trim()
            ? "Tidak ada booking yang cocok dengan pencarian."
            : "Tidak ada booking ditemukan."}
        </p>
        {searchQuery?.trim() ? (
          <p className="text-xs text-gray-400 mt-1">
            Coba kata kunci lain: nama pasien, pemilik, dokter, atau layanan.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map(([tanggal, items], index) => (
        <section key={tanggal}>
          <div
            className={`flex items-center gap-3 mb-3 px-1 ${
              index === 0 ? "pt-1" : ""
            }`}
          >
            <h3 className="text-sm font-semibold text-gray-700">
              {formatTanggalIndo(tanggal)}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {items.length} booking
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={onSelectBooking}
              />
            ))}
          </div>
        </section>
      ))}

      <div ref={sentinelRef} className="h-1" aria-hidden />

      {loadingMore ? (
        <LoadingBlock message="Memuat booking lainnya..." compact />
      ) : hasMore ? (
        <p className="text-center text-xs text-gray-400 pb-2">
          Gulir ke bawah untuk memuat lebih banyak
        </p>
      ) : bookings.length > 0 ? (
        <p className="text-center text-xs text-gray-400 pb-2">
          {searchQuery?.trim()
            ? "Semua hasil pencarian ditampilkan"
            : "Semua booking sudah ditampilkan"}
        </p>
      ) : null}
    </div>
  );
}
