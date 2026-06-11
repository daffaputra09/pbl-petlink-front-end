"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import IncomeList, { IncomeListHeader } from "@/components/keuangan/IncomeList";
import FinancePagination from "@/components/keuangan/FinancePagination";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikPageLoading,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicIncome } from "@/hooks/use-clinic-income";

const PAGE_SIZE = 15;

export default function PendapatanPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { items, total, loading, error } = useClinicIncome({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    search,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <KlinikPageLayout
      title="Riwayat Pendapatan"
      description="Pembayaran lunas dari booking dan konsultasi customer"
      maxWidth="6xl"
      backHref="/klinik/keuangan"
      backLabel="Kembali ke Keuangan"
    >
      <div className="relative w-full sm:max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Cari nama customer..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {error ? <KlinikPageAlert message={error} /> : null}

      <KlinikSectionCard>
        <IncomeListHeader total={total} />
        {loading ? (
          <KlinikPageLoading message="Memuat pendapatan..." />
        ) : (
          <IncomeList
            data={items}
            emptyMessage={
              search
                ? "Tidak ada transaksi untuk pencarian ini."
                : "Belum ada pendapatan tercatat."
            }
          />
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
