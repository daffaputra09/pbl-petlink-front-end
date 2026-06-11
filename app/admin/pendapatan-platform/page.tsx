"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Coins, Loader2, TrendingUp, Wallet, ChevronRight } from "lucide-react";
import { useAdminPlatformFeeStats } from "@/hooks/use-admin-platform-fees";
import { formatRupiah, formatRupiahAxis } from "@/lib/admin/format";

export default function AdminPendapatanPlatformPage() {
  const [year] = useState(new Date().getFullYear());
  const { stats, loading, error } = useAdminPlatformFeeStats(year);

  const chartData =
    stats?.monthly?.map((m) => ({
      name: m.label,
      platform_fee: Number(m.platform_fee),
      gmv: Number(m.gmv),
    })) ?? [];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pendapatan Platform</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Biaya layanan aplikasi 10% dari setiap transaksi booking dan konsultasi
            yang dibayar customer.
          </p>
        </div>
        <Link
          href="/admin/pendapatan-platform/riwayat"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
        >
          Lihat riwayat transaksi
          <ChevronRight size={16} />
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          {error}
          <span className="block text-xs mt-1 text-red-500">
            Pastikan migrasi platform fee sudah di-push ke Supabase.
          </span>
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Fee Platform",
                value: formatRupiah(Number(stats?.total_platform_fee ?? 0)),
                sub: "Akumulasi sejak fitur aktif",
                icon: Coins,
              },
              {
                label: "Fee Bulan Ini",
                value: formatRupiah(Number(stats?.platform_fee_this_month ?? 0)),
                sub:
                  stats?.platform_fee_growth_percent != null
                    ? `${stats.platform_fee_growth_percent > 0 ? "+" : ""}${stats.platform_fee_growth_percent}% vs bulan lalu`
                    : "Belum ada perbandingan",
                icon: TrendingUp,
              },
              {
                label: "Total GMV",
                value: formatRupiah(Number(stats?.total_gmv ?? 0)),
                sub: "Volume transaksi customer (bruto)",
                icon: Wallet,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-start justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">{card.sub}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#0D6853]/10 flex items-center justify-center text-[#0D6853]">
                  <card.icon size={22} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">
                Fee Platform per Bulan
              </h2>
              <span className="text-xs text-gray-500 bg-stone-100 px-3 py-1 rounded-full">
                {year}
              </span>
            </div>
            {chartData.every((d) => d.platform_fee === 0) ? (
              <p className="text-sm text-gray-400 text-center py-16">
                Belum ada fee platform tercatat untuk grafik ini.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => formatRupiahAxis(Number(v))}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) => [
                      formatRupiah(v),
                      name === "platform_fee" ? "Fee Platform" : "GMV",
                    ]}
                  />
                  <Bar
                    dataKey="platform_fee"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    name="platform_fee"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
