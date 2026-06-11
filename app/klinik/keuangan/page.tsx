"use client";

import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  CalendarDays,
  ArrowDownToLine,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import StatCard from "@/components/keuangan/FinanceStatCard";
import GrafikPendapatan from "@/components/keuangan/GrafikPendapatan";
import FinanceActivityPanel from "@/components/keuangan/FinanceActivityPanel";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikPageLoading,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicFinance } from "@/hooks/use-clinic-finance";
import { formatRupiah } from "@/lib/keuangan/format";

export default function KeuanganPage() {
  const {
    balance,
    pendapatanHariIni,
    pendapatanBulanIni,
    grafikMingguan,
    recentPendapatan,
    totalPendapatan,
    recentPenarikan,
    totalPenarikan,
    totalPenarikanBerhasil,
    pendingPenarikan,
    loading,
    error,
  } = useClinicFinance();

  return (
    <KlinikPageLayout
      title="Keuangan"
      description="Ringkasan saldo, pendapatan, dan penarikan dana klinik"
      maxWidth="6xl"
      actions={
        <Link
          href="/klinik/keuangan/penarikan"
          className="inline-flex items-center gap-2 bg-[#1E6B4F] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#165a3f] transition shrink-0"
        >
          <ArrowDownToLine size={16} />
          Tarik Dana
        </Link>
      }
    >
      {loading ? (
        <KlinikPageLoading message="Memuat data keuangan..." />
      ) : error ? (
        <KlinikPageAlert message={error} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Saldo Tersedia"
              value={formatRupiah(balance)}
              icon={<Wallet size={18} />}
              highlight
            />
            <StatCard
              label="Pendapatan Hari Ini"
              value={formatRupiah(pendapatanHariIni)}
              icon={<TrendingUp size={18} />}
            />
            <StatCard
              label="Pendapatan Bulan Ini"
              value={formatRupiah(pendapatanBulanIni)}
              icon={<CalendarDays size={18} />}
            />
            <StatCard
              label="Total Penarikan Berhasil"
              value={formatRupiah(totalPenarikanBerhasil)}
              icon={<ArrowUpRight size={18} />}
            />
          </div>

          {pendingPenarikan > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Clock size={18} className="shrink-0" />
              <p>
                {pendingPenarikan} permohonan penarikan sedang diproses admin.
                <Link
                  href="/klinik/keuangan/penarikan/riwayat"
                  className="ml-1 font-semibold underline"
                >
                  Lihat status
                </Link>
              </p>
            </div>
          ) : null}

          <GrafikPendapatan data={grafikMingguan} />

          <FinanceActivityPanel
            recentPendapatan={recentPendapatan}
            totalPendapatan={totalPendapatan}
            recentPenarikan={recentPenarikan}
            totalPenarikan={totalPenarikan}
            pendingPenarikan={pendingPenarikan}
          />
        </>
      )}
    </KlinikPageLayout>
  );
}
