"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import TransferProofViewer from "@/components/keuangan/TransferProofViewer";
import { isViewableTransferProofUrl } from "@/lib/keuangan/transfer-proof-url";
import { AdminPageSearch } from "@/components/layout/AdminPageSearch";
import { useAdminWithdrawals } from "@/hooks/use-admin-withdrawals";
import { formatRupiah, formatDateId } from "@/lib/admin/format";

const PAGE_SIZE = 10;

function statusBadge(status: string) {
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-800 bg-red-50 px-2.5 py-1 rounded-full">
        <XCircle size={12} />
        Ditolak
      </span>
    );
  }
  if (status === "approved" || status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 size={12} />
        Berhasil
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
        Menunggu
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
      {status}
    </span>
  );
}

export default function AdminRiwayatPenarikanPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { items, total, loading, error } = useAdminWithdrawals({
    status: null,
    search,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Penarikan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Catatan seluruh permohonan penarikan dana dari mitra klinik.
          </p>
        </div>
        <AdminPageSearch
          placeholder="Cari nama klinik..."
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
        />
      </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">
              <div className="col-span-3">Nama Klinik</div>
              <div className="col-span-2">Tanggal</div>
              <div className="col-span-3">Bank & Rekening</div>
              <div className="col-span-2">Jumlah</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Bukti</div>
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-12">
                  Tidak ada riwayat.
                </p>
              ) : (
                items.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 md:grid md:grid-cols-12 md:gap-2 md:items-center"
                  >
                    <div className="md:col-span-3 flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                        {w.clinic_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {w.clinic_name}
                        </p>
                        <p className="text-xs text-gray-400">ID: {w.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-600 mb-2 md:mb-0">
                      {formatDateId(w.created_at)}
                    </div>
                    <div className="md:col-span-3 text-sm text-gray-600 mb-2 md:mb-0">
                      {w.bank_name} — {w.account_number}
                      <br />
                      <span className="text-xs text-gray-500">
                        a.n {w.account_name}
                      </span>
                    </div>
                    <div className="md:col-span-2 font-semibold text-gray-900 mb-2 md:mb-0">
                      {formatRupiah(Number(w.amount))}
                    </div>
                    <div className="md:col-span-1 mb-2 md:mb-0">{statusBadge(w.status)}</div>
                    <div className="md:col-span-1">
                      {isViewableTransferProofUrl(w.transfer_proof_url) ? (
                        <TransferProofViewer url={w.transfer_proof_url} compact />
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
              <p>
                Menampilkan {items.length} dari {total} riwayat
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-2 rounded-lg border disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2">{page + 1}</span>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
