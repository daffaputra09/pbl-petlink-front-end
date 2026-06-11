"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Star,
  TrendingUp,
  Wallet,
  Users,
  HeartHandshake,
  AlertCircle,
} from "lucide-react";
import StatCard from "@/components/keuangan/FinanceStatCard";
import DashboardWeeklyChart, {
  DashboardRevenueTrend,
} from "@/components/dashboard/DashboardWeeklyChart";
import DashboardStatusChart from "@/components/dashboard/DashboardStatusChart";
import DashboardRecentBookings from "@/components/dashboard/DashboardRecentBookings";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikPageLoading,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicDashboard } from "@/hooks/use-clinic-dashboard";
import { formatRupiah } from "@/lib/keuangan/format";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const { data, loading, error, clinicName } = useClinicDashboard();

  return (
    <KlinikPageLayout
      title={`${greeting()}, ${clinicName}`}
      description="Ringkasan operasional klinik hari ini"
      maxWidth="7xl"
    >
      {loading ? (
        <KlinikPageLoading message="Memuat dashboard..." />
      ) : error ? (
        <KlinikPageAlert message={error} />
      ) : data ? (
        <>
          {data.stats.pendingWithdrawals > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={18} className="shrink-0" />
              <p>
                {data.stats.pendingWithdrawals} permohonan penarikan menunggu
                persetujuan admin.{" "}
                <Link
                  href="/klinik/keuangan/penarikan/riwayat"
                  className="font-semibold underline"
                >
                  Lihat status
                </Link>
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Booking Hari Ini"
              value={String(data.stats.bookingToday)}
              icon={<CalendarDays size={18} />}
              highlight
            />
            <StatCard
              label="Booking Mendatang"
              value={String(data.stats.bookingUpcoming)}
              icon={<Clock size={18} />}
            />
            <StatCard
              label="Saldo Tersedia"
              value={formatRupiah(data.stats.balance)}
              icon={<Wallet size={18} />}
            />
            <StatCard
              label="Pendapatan Bulan Ini"
              value={formatRupiah(data.stats.revenueMonth)}
              icon={<TrendingUp size={18} />}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Pendapatan Hari Ini"
              value={formatRupiah(data.stats.revenueToday)}
              icon={<TrendingUp size={18} />}
            />
            <StatCard
              label="Rating Klinik"
              value={
                data.stats.reviewCount > 0
                  ? `${data.stats.rating.toFixed(1)} ★`
                  : "—"
              }
              icon={<Star size={18} />}
            />
            <StatCard
              label="Dokter Aktif"
              value={String(data.stats.activeDoctors)}
              icon={<Users size={18} />}
            />
            <StatCard
              label="Layanan Aktif"
              value={String(data.stats.activeServices)}
              icon={<HeartHandshake size={18} />}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <DashboardWeeklyChart data={data.weekly} />
            </div>
            <DashboardStatusChart data={data.statusBreakdown} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <DashboardRevenueTrend data={data.weekly} />
            <DashboardRecentBookings bookings={data.recentBookings} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Akses Cepat
            </h2>
            <DashboardQuickActions />
          </div>
        </>
      ) : null}
    </KlinikPageLayout>
  );
}
