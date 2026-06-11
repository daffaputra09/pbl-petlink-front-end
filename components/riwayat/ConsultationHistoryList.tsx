"use client";

import { Loader2 } from "lucide-react";
import ConsultationHistoryItem from "@/components/riwayat/ConsultationHistoryItem";
import type { ConsultationHistoryItem as Item } from "@/types/riwayat";

type Props = {
  items: Item[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelect: (item: Item) => void;
  detailLoadingId?: string | null;
  searchQuery?: string;
};

export default function ConsultationHistoryList({
  items,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onSelect,
  detailLoadingId,
  searchQuery,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 px-6 text-center">
        <p className="text-sm text-gray-500">
          {searchQuery?.trim()
            ? "Tidak ada konsultasi yang cocok dengan pencarian."
            : "Belum ada riwayat konsultasi."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <ConsultationHistoryItem
          key={item.id}
          item={item}
          onClick={() => onSelect(item)}
          loading={detailLoadingId === item.id}
        />
      ))}
      {hasMore && onLoadMore ? (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm font-medium text-[#1E6B4F] hover:underline disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" />
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
