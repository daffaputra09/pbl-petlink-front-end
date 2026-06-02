"use client";

import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  CalendarDays,
  ArrowDownToLine,
  ArrowUpRight,
} from "lucide-react";
import StatCard from "@/components/keuangan/FinanceStatCard";
import GrafikPendapatan from "@/components/keuangan/GrafikPendapatan";
import HistoryPenarikanTable from "@/components/keuangan/HistoryPenarikanTable";
import { useClinicFinance } from "@/hooks/use-clinic-finance";

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

export default function KeuanganPage() {
  const {
    balance,
    pendapatanHariIni,
    pendapatanBulanIni,
    grafikMingguan,
    historyPenarikan,
    loading,
  } = useClinicFinance();

  const totalPenarikan = historyPenarikan
    .filter((h) => h.status === "Berhasil")
    .reduce((s, h) => s + h.jumlah, 0);

  return (
    <div className="flex flex-col bg-gray-50 font-sans">
      <header className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Keuangan</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Kelola saldo dan penarikan dana klinik
            </p>
          </div>
          <Link
            href="/klinik/keuangan/penarikan"
            className="flex items-center gap-2 bg-[#1E6B4F] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#165a3f] transition"
          >
            <ArrowDownToLine size={16} />
            Tarik Dana
          </Link>
        </div>
      </header>

      <div className="px-6 py-5 flex flex-col gap-5">
        {loading ? (
          <p className="text-sm text-gray-500">Memuat data keuangan...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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
                label="Total Penarikan"
                value={formatRupiah(totalPenarikan)}
                icon={<ArrowUpRight size={18} />}
              />
            </div>
            <GrafikPendapatan data={grafikMingguan} />
            <HistoryPenarikanTable data={historyPenarikan} />
          </>
        )}
      </div>
    </div>
  );
}
