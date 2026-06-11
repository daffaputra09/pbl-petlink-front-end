"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AdminPageSearch } from "@/components/layout/AdminPageSearch";
import { useAdminPlatformFeeList } from "@/hooks/use-admin-platform-fees";
import { formatPaymentMethod } from "@/lib/keuangan/format";
import { formatRupiah, formatDateId } from "@/lib/admin/format";

const PAGE_SIZE = 10;

const TYPE_FILTERS = [
  { id: null, label: "Semua" },
  { id: "booking" as const, label: "Booking" },
  { id: "consultation" as const, label: "Konsultasi" },
];

export default function AdminRiwayatPlatformFeePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [referenceType, setReferenceType] = useState<
    "booking" | "consultation" | null
  >(null);
  const { items, total, loading, error } = useAdminPlatformFeeList({
    search,
    referenceType,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/pendapatan-platform"
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline mb-3"
        >
          <ChevronLeft size={16} />
          Kembali ke ringkasan
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Riwayat Fee Platform
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Transaksi dengan potongan biaya layanan 10% untuk aplikasi.
            </p>
          </div>
          <AdminPageSearch
            placeholder="Cari klinik atau customer..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(0);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setReferenceType(filter.id);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              referenceType === filter.id
                ? "bg-emerald-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Belum ada transaksi dengan fee platform.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-5 py-3 font-medium">Klinik</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Tipe</th>
                  <th className="text-right px-5 py-3 font-medium">Bruto</th>
                  <th className="text-right px-5 py-3 font-medium">Fee 10%</th>
                  <th className="text-right px-5 py-3 font-medium">Net Klinik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-gray-800 font-medium">
                        {formatDateId(row.paid_at)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatPaymentMethod(
                          row.payment_method,
                          row.midtrans_payment_type
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {row.clinic_name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {row.customer_name}
                    </td>
                    <td className="px-5 py-4 text-gray-600 capitalize">
                      {row.reference_type === "booking"
                        ? "Booking"
                        : "Konsultasi"}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-700">
                      {formatRupiah(Number(row.amount))}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                      {formatRupiah(Number(row.platform_fee))}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">
                      {formatRupiah(Number(row.clinic_net_amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/60">
            <p className="text-xs text-gray-500">
              {total} transaksi · halaman {page + 1} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
