"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface FinancePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function FinancePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: FinancePaginationProps) {
  if (total <= pageSize) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/60">
      <p className="text-xs text-gray-500">
        Menampilkan {from}–{to} dari {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Sebelumnya
        </button>
        <span className="text-xs text-gray-500 min-w-[4rem] text-center">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white disabled:opacity-40"
        >
          Berikutnya
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
