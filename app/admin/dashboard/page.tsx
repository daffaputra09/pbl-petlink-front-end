"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseMedical,
  Users,
  Wallet,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { formatRupiah, formatRupiahCompact, formatDateId } from "@/lib/admin/format";

function activityIcon(kind: string) {
  if (kind.includes("pending")) return Clock;
  if (kind.includes("rejected")) return XCircle;
  if (kind.includes("registered")) return BriefcaseMedical;
  return CheckCircle2;
}

export default function AdminDashboardPage() {
  const [year] = useState(new Date().getFullYear());
  const { stats, activity, loading, error } = useAdminDashboard(year);

  const chartData =
    stats?.monthly?.map((m) => ({
      name: m.label,
      amount: Number(m.amount),
    })) ?? [];

  return (
    <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Pantau kesehatan ekosistem PetLink. Berikut ringkasan performa
            platform.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {error}
            <span className="block text-xs mt-1 text-red-500">
              Pastikan migrasi admin sudah di-push ke Supabase.
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
                  label: "Total Klinik",
                  value: stats?.total_clinics ?? 0,
                  sub: `+${stats?.clinics_this_month ?? 0} bulan ini`,
                  icon: BriefcaseMedical,
                },
                {
                  label: "Total Pengguna",
                  value: stats?.total_users ?? 0,
                  sub: `+${stats?.users_this_month ?? 0} bulan ini`,
                  icon: Users,
                },
                {
                  label: "Total Pendapatan",
                  value: formatRupiahCompact(Number(stats?.total_revenue ?? 0)),
                  sub:
                    stats?.revenue_growth_percent != null
                      ? `${stats.revenue_growth_percent > 0 ? "+" : ""}${stats.revenue_growth_percent}% vs bulan lalu`
                      : "Belum ada perbandingan",
                  icon: Wallet,
                  raw: false,
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
                      {card.raw === false
                        ? card.value
                        : Number(card.value).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">{card.sub}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#0D6853]/10 flex items-center justify-center text-[#0D6853]">
                    <card.icon size={22} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900">
                    Pertumbuhan Transaksi Bulanan
                  </h2>
                  <span className="text-xs text-gray-500 bg-stone-100 px-3 py-1 rounded-full">
                    {year}
                  </span>
                </div>
                {chartData.every((d) => d.amount === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-16">
                    Belum ada pembayaran tercatat untuk grafik ini.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => formatRupiahCompact(v)}
                      />
                      <Tooltip
                        formatter={(v: number) => [formatRupiah(v), "Pendapatan"]}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#059669"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Aktivitas Terbaru
                </h2>
                <ul className="space-y-4">
                  {activity.length === 0 ? (
                    <li className="text-sm text-gray-400">Belum ada aktivitas.</li>
                  ) : (
                    activity.map((item, i) => {
                      const Icon = activityIcon(item.kind);
                      return (
                        <li key={`${item.reference_id}-${i}`} className="flex gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-700">
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">{item.subtitle}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatDateId(item.sort_at)}
                            </p>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
