"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import WithdrawList, {
  WithdrawListHeader,
} from "@/components/keuangan/WithdrawList";
import FinancePagination from "@/components/keuangan/FinancePagination";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicWithdrawals } from "@/hooks/use-clinic-withdrawals";
import {
  isWithdrawInProgress,
  WITHDRAW_STATUS_FILTERS,
} from "@/lib/keuangan/format";
import type { WithdrawFilterValue } from "@/lib/keuangan/withdraw-status";

const PAGE_SIZE = 15;

export default function RiwayatPenarikanPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<WithdrawFilterValue>(null);
  const { items, total, loading, error } = useClinicWithdrawals({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    status,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const inProgressOnPage = items.filter((item) =>
    isWithdrawInProgress(item.rawStatus)
  ).length;

  return (
    <KlinikPageLayout
      title="Riwayat Penarikan"
      description="Semua permohonan penarikan dana ke rekening klinik"
      maxWidth="6xl"
      backHref="/klinik/keuangan"
      actions={
        <Link
          href="/klinik/keuangan/penarikan"
          className="inline-flex items-center gap-2 bg-[#1E6B4F] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#165a3f] transition"
        >
          Ajukan Penarikan
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        {WITHDRAW_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              status === filter.value
                ? "bg-[#1E6B4F] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error ? <KlinikPageAlert message={error} /> : null}

      <KlinikSectionCard>
        <WithdrawListHeader
          total={total}
          pendingCount={inProgressOnPage}
        />
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : (
          <WithdrawList data={items} />
        )}
        <FinancePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </KlinikSectionCard>
    </KlinikPageLayout>
  );
}
