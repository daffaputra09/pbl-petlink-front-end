"use client";

import HistoryPendapatanTable from "@/components/keuangan/HistoryPendapatanTable";

const historyPendapatan = [
  {
    id: "TRX001",
    created_at: "2026-06-04T10:00:00Z",
    pasien_nama: "Ahmad Fauzi",
    layanan: "Konsultasi Umum",
    nominal: 150000,
    metode_pembayaran: "QRIS",
  },
  {
    id: "TRX002",
    created_at: "2026-06-03T14:30:00Z",
    pasien_nama: "Siti Aminah",
    layanan: "Pemeriksaan Gigi",
    nominal: 250000,
    metode_pembayaran: "Transfer Bank",
  },
];

export default function PendapatanPage() {
  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">
          Riwayat Pendapatan
        </h1>
        <p className="text-sm text-gray-500">
          Seluruh transaksi pendapatan klinik
        </p>
      </div>

      <HistoryPendapatanTable data={historyPendapatan} />
    </div>
  );
}