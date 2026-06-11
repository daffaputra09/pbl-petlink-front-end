"use client";

import { useState } from "react";
import IncomeList, {
  IncomeListFooter,
} from "@/components/keuangan/IncomeList";
import WithdrawList, {
  WithdrawListFooter,
} from "@/components/keuangan/WithdrawList";
import type { HistoryPenarikan, Pendapatan } from "@/types/keuangan";

type ActivityTab = "pendapatan" | "penarikan";

interface FinanceActivityPanelProps {
  recentPendapatan: Pendapatan[];
  totalPendapatan: number;
  recentPenarikan: HistoryPenarikan[];
  totalPenarikan: number;
  pendingPenarikan?: number;
}

export default function FinanceActivityPanel({
  recentPendapatan,
  totalPendapatan,
  recentPenarikan,
  totalPenarikan,
  pendingPenarikan = 0,
}: FinanceActivityPanelProps) {
  const [tab, setTab] = useState<ActivityTab>("pendapatan");

  const tabs: { id: ActivityTab; label: string; count: number }[] = [
    { id: "pendapatan", label: "Pendapatan", count: totalPendapatan },
    { id: "penarikan", label: "Penarikan", count: totalPenarikan },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-0 border-b border-gray-100">
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900">Aktivitas Keuangan</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Transaksi terbaru dari pembayaran customer dan penarikan dana
          </p>
        </div>
        <div className="flex gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors border-b-2 -mb-px ${
                tab === item.id
                  ? "text-[#1E6B4F] border-[#1E6B4F] bg-emerald-50/50"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {item.label}
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  tab === item.id
                    ? "bg-[#1E6B4F] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {item.count}
              </span>
              {item.id === "penarikan" && pendingPenarikan > 0 ? (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {pendingPenarikan} proses
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {tab === "pendapatan" ? (
        <>
          <IncomeList data={recentPendapatan} compact />
          <IncomeListFooter
            total={totalPendapatan}
            href="/klinik/keuangan/pendapatan"
          />
        </>
      ) : (
        <>
          <WithdrawList data={recentPenarikan} compact />
          <WithdrawListFooter
            total={totalPenarikan}
            href="/klinik/keuangan/penarikan/riwayat"
          />
        </>
      )}
    </div>
  );
}
