import Link from "next/link";
import { CreditCard, Wallet } from "lucide-react";

interface Pendapatan {
  id: string;
  created_at: string;
  pasien_nama: string;
  layanan: string;
  nominal: number;
  metode_pembayaran: string;
}

interface HistoryPendapatanTableProps {
  data?: Pendapatan[];
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

export default function HistoryPendapatanTable({
  data = [],
}: HistoryPendapatanTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Riwayat Pendapatan
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {data.length} transaksi
          </p>
          <Link
            href="/klinik/keuangan/pendapatan"
            className="text-sm font-medium text-[#1E6B4F] hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3">ID</th>
              <th className="text-left px-5 py-3">Tanggal</th>
              <th className="text-left px-5 py-3">Pasien</th>
              <th className="text-left px-5 py-3">Layanan</th>
              <th className="text-left px-5 py-3">Metode</th>
              <th className="text-right px-5 py-3">Nominal</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                  {item.id.slice(0, 8)}
                </td>

                <td className="px-5 py-4">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </td>

                <td className="px-5 py-4 font-medium text-gray-800">
                  {item.pasien_nama}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {item.layanan}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                      <Wallet size={14} className="text-green-600" />
                    </div>
                    <span>{item.metode_pembayaran}</span>
                  </div>
                </td>

                <td className="px-5 py-4 text-right">
                  <span className="font-semibold text-emerald-600">
                    {formatRupiah(item.nominal)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}