"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardWeeklyPoint } from "@/types/dashboard";
import { formatRupiah, formatRupiahAxis } from "@/lib/money/format-rupiah";
import { KlinikSectionCard } from "@/components/klinik/KlinikPageLayout";

type Props = {
  data: DashboardWeeklyPoint[];
};

export default function DashboardWeeklyChart({ data }: Props) {
  const hasRevenue = data.some((d) => d.pendapatan > 0);
  const hasBooking = data.some((d) => d.booking > 0);

  return (
    <KlinikSectionCard
      title="Aktivitas 7 Hari Terakhir"
      description="Pendapatan lunas & jumlah booking terjadwal"
    >
      <div className="px-5 pb-5 pt-2">
        {!hasRevenue && !hasBooking ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Belum ada aktivitas booking atau pendapatan minggu ini.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatRupiahAxis(Number(v))}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "pendapatan") return [formatRupiah(value), "Pendapatan"];
                  return [value, "Booking"];
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "pendapatan" ? "Pendapatan" : "Booking"
                }
              />
              <Bar
                yAxisId="left"
                dataKey="booking"
                name="booking"
                fill="#93C5FD"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                yAxisId="right"
                dataKey="pendapatan"
                name="pendapatan"
                fill="#1E6B4F"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </KlinikSectionCard>
  );
}

export function DashboardRevenueTrend({ data }: Props) {
  const hasRevenue = data.some((d) => d.pendapatan > 0);

  return (
    <KlinikSectionCard
      title="Tren Pendapatan"
      description="Pembayaran lunas per hari"
    >
      <div className="px-5 pb-5 pt-2">
        {!hasRevenue ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Belum ada pendapatan minggu ini.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E6B4F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1E6B4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatRupiahAxis(Number(v))}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                }}
                formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
              />
              <Area
                type="monotone"
                dataKey="pendapatan"
                stroke="#1E6B4F"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </KlinikSectionCard>
  );
}
