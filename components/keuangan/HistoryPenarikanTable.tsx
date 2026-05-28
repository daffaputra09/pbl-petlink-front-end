import { HistoryPenarikan, StatusPenarikan } from "@/types/keuangan";
import { CheckCircle2, Clock, XCircle, Building2 } from "lucide-react";

interface HistoryPenarikanTableProps {
  data: HistoryPenarikan[];
}

function StatusBadge({ status }: { status: StatusPenarikan }) {
  const config = {
    Berhasil: {
      icon: <CheckCircle2 size={13} />,
      className: "bg-emerald-50 text-emerald-600",
    },
    Diproses: {
      icon: <Clock size={13} />,
      className: "bg-amber-50 text-amber-500",
    },
    Gagal: {
      icon: <XCircle size={13} />,
      className: "bg-red-50 text-red-500",
    },
  };

  const { icon, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
      {icon}
      {status}
    </span>
  );
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

export default function HistoryPenarikanTable({ data }: HistoryPenarikanTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Riwayat Penarikan</h3>
          <p className="text-xs text-gray-400 mt-0.5">{data.length} transaksi</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">ID</th>
              <th className="text-left px-5 py-3 font-medium">Tanggal</th>
              <th className="text-left px-5 py-3 font-medium">Bank / Rekening</th>
              <th className="text-right px-5 py-3 font-medium">Jumlah</th>
              <th className="text-center px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">{item.id}</td>
                <td className="px-5 py-4">
                  <p className="text-gray-800 font-medium">{item.tanggal}</p>
                  <p className="text-gray-400 text-xs">{item.waktu}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E8F5EE] flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-[#1E6B4F]" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{item.namaBank}</p>
                      <p className="text-gray-400 text-xs">{item.nomorRekening} · {item.atasNama}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-semibold text-gray-900">{formatRupiah(item.jumlah)}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
