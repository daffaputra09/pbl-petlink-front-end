"use client";

import { Loader2, Stethoscope } from "lucide-react";
import HandlingHistoryItem from "@/components/riwayat/HandlingHistoryItem";
import type { HandlingHistoryEntry } from "@/types/riwayat";

type Props = {
  items: HandlingHistoryEntry[];
  loading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelect: (entry: HandlingHistoryEntry) => void;
  detailLoadingId?: string | null;
  searchQuery?: string;
};

export default function HandlingHistoryList({
  items,
  loading,
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
        <StethoscopePlaceholder />
        <p className="text-sm text-gray-500 mt-3">
          {searchQuery?.trim()
            ? "Tidak ada penanganan yang cocok dengan pencarian."
            : "Belum ada riwayat penanganan dokter."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.map((entry) => (
        <HandlingHistoryItem
          key={entry.id}
          entry={entry}
          onClick={() => onSelect(entry)}
          loading={detailLoadingId === entry.id}
        />
      ))}
      {hasMore && onLoadMore ? (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="text-sm font-medium text-[#1E6B4F] hover:underline"
          >
            Muat lebih banyak
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StethoscopePlaceholder() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] text-[#1E6B4F] flex items-center justify-center">
        <Stethoscope size={24} />
    </div>
  );
}
