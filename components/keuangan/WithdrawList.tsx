"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import TransferProofViewer from "@/components/keuangan/TransferProofViewer";
import { formatRupiah } from "@/lib/keuangan/format";
import { isViewableTransferProofUrl } from "@/lib/keuangan/transfer-proof-url";
import type { HistoryPenarikan, StatusPenarikan } from "@/types/keuangan";

interface WithdrawListProps {
  data: HistoryPenarikan[];
  compact?: boolean;
  emptyMessage?: string;
}

function StatusBadge({ status }: { status: StatusPenarikan }) {
  const config: Record<
    StatusPenarikan,
    { icon: React.ReactNode; className: string }
  > = {
    Menunggu: {
      icon: <Clock size={13} />,
      className: "bg-amber-50 text-amber-700 border border-amber-100",
    },
    Berhasil: {
      icon: <CheckCircle2 size={13} />,
      className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    Ditolak: {
      icon: <XCircle size={13} />,
      className: "bg-red-50 text-red-600 border border-red-100",
    },
  };

  const { icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {icon}
      {status}
    </span>
  );
}

export default function WithdrawList({
  data,
  compact = false,
  emptyMessage = "Belum ada permohonan penarikan.",
}: WithdrawListProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-3">
          <Building2 size={22} className="text-[#1E6B4F]" />
        </div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "divide-y divide-gray-50" : "overflow-x-auto"}>
      {compact ? (
        data.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-[#1E6B4F]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatRupiah(item.jumlah)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.namaBank} · {item.nomorRekening}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {item.tanggal} · {item.waktu}
              </p>
              {item.status === "Ditolak" && item.rejectionReason ? (
                <p className="text-[11px] text-red-500 mt-1 line-clamp-2">
                  {item.rejectionReason}
                </p>
              ) : null}
              {item.status === "Berhasil" && isViewableTransferProofUrl(item.transferProofUrl) ? (
                <div className="mt-2">
                  <TransferProofViewer url={item.transferProofUrl} compact />
                </div>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Tanggal</th>
              <th className="text-left px-5 py-3 font-medium">Rekening Tujuan</th>
              <th className="text-right px-5 py-3 font-medium">Jumlah</th>
              <th className="text-center px-5 py-3 font-medium">Status</th>
              <th className="text-center px-5 py-3 font-medium">Bukti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-gray-800 font-medium">{item.tanggal}</p>
                  <p className="text-gray-400 text-xs">{item.waktu}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-gray-800 font-medium">{item.namaBank}</p>
                  <p className="text-gray-400 text-xs">
                    {item.nomorRekening} · {item.atasNama}
                  </p>
                  {item.status === "Ditolak" && item.rejectionReason ? (
                    <p className="text-xs text-red-500 mt-1">
                      {item.rejectionReason}
                    </p>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                  {formatRupiah(item.jumlah)}
                </td>
                <td className="px-5 py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-5 py-4 text-center">
                  {item.status === "Berhasil" && isViewableTransferProofUrl(item.transferProofUrl) ? (
                    <TransferProofViewer
                      url={item.transferProofUrl}
                      compact
                    />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function WithdrawListFooter({
  total,
  href,
}: {
  total: number;
  href: string;
}) {
  if (total <= 0) return null;

  return (
    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E6B4F] hover:underline"
      >
        Lihat semua {total} penarikan
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function WithdrawListHeader({
  total,
  pendingCount = 0,
  showLink = false,
}: {
  total: number;
  pendingCount?: number;
  showLink?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Riwayat Penarikan</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {total} permohonan
          {pendingCount > 0 ? ` · ${pendingCount} menunggu proses` : ""}
        </p>
      </div>
      {showLink && total > 0 ? (
        <Link
          href="/klinik/keuangan/penarikan/riwayat"
          className="text-xs font-semibold text-[#1E6B4F] hover:underline"
        >
          Lihat semua
        </Link>
      ) : null}
    </div>
  );
}
