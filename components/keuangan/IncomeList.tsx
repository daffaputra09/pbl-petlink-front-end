"use client";

import Link from "next/link";
import { ArrowRight, Receipt, Wallet } from "lucide-react";
import {
  formatIncomeDate,
  formatIncomeTime,
  formatRupiah,
} from "@/lib/keuangan/format";
import type { Pendapatan } from "@/types/keuangan";

function feeBreakdownText(item: Pendapatan): string | null {
  if (
    item.platform_fee == null ||
    item.gross_amount == null ||
    item.platform_fee <= 0
  ) {
    return null;
  }
  return `Dari ${formatRupiah(item.gross_amount)} · biaya platform ${formatRupiah(item.platform_fee)}`;
}

interface IncomeListProps {
  data: Pendapatan[];
  compact?: boolean;
  emptyMessage?: string;
}

export default function IncomeList({
  data,
  compact = false,
  emptyMessage = "Belum ada pendapatan tercatat.",
}: IncomeListProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
          <Receipt size={22} className="text-emerald-600" />
        </div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "divide-y divide-gray-50" : "overflow-x-auto"}>
      {compact ? (
        data.map((item) => {
          const feeNote = feeBreakdownText(item);
          return (
          <div
            key={item.id}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Wallet size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.pasien_nama}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.layanan}
                  </p>
                  {feeNote ? (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {feeNote}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm font-bold text-emerald-600 shrink-0">
                  {formatRupiah(item.nominal)}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                <span>
                  {formatIncomeDate(item.created_at)} ·{" "}
                  {formatIncomeTime(item.created_at)}
                </span>
                <span>·</span>
                <span>{item.metode_pembayaran}</span>
              </div>
            </div>
          </div>
          );
        })
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Tanggal</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Layanan</th>
              <th className="text-left px-5 py-3 font-medium">Metode</th>
              <th className="text-right px-5 py-3 font-medium">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => {
              const feeNote = feeBreakdownText(item);
              return (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-gray-800 font-medium">
                    {formatIncomeDate(item.created_at)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatIncomeTime(item.created_at)}
                  </p>
                </td>
                <td className="px-5 py-4 font-medium text-gray-800">
                  {item.pasien_nama}
                </td>
                <td className="px-5 py-4 text-gray-600 max-w-xs">
                  <p className="truncate">{item.layanan}</p>
                  {item.reference_type ? (
                    <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                      {item.reference_type === "booking"
                        ? "Booking"
                        : "Konsultasi"}
                    </p>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {item.metode_pembayaran}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-semibold text-emerald-600">
                    {formatRupiah(item.nominal)}
                  </span>
                  {feeNote ? (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {feeNote}
                    </p>
                  ) : null}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function IncomeListFooter({
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
        Lihat semua {total} transaksi
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function IncomeListHeader({
  total,
  showLink = false,
}: {
  total: number;
  showLink?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Riwayat Pendapatan</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {total} transaksi lunas dari pembayaran customer
        </p>
      </div>
      {showLink && total > 0 ? (
        <Link
          href="/klinik/keuangan/pendapatan"
          className="text-xs font-semibold text-[#1E6B4F] hover:underline"
        >
          Lihat semua
        </Link>
      ) : null}
    </div>
  );
}
