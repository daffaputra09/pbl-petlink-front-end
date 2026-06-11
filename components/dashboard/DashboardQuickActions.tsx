"use client";

import Link from "next/link";
import {
  CalendarDays,
  HeartHandshake,
  Stethoscope,
  Wallet,
  MessageCircle,
  ArrowDownToLine,
  History,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/klinik/booking",
    label: "Kelola Booking",
    description: "Lihat & update janji temu",
    icon: CalendarDays,
    accent: "bg-[#E8F5EE] text-[#1E6B4F]",
  },
  {
    href: "/klinik/layanan",
    label: "Layanan",
    description: "Atur harga & durasi",
    icon: HeartHandshake,
    accent: "bg-violet-50 text-violet-700",
  },
  {
    href: "/klinik/dokter",
    label: "Dokter",
    description: "Kelola tim medis",
    icon: Stethoscope,
    accent: "bg-sky-50 text-sky-700",
  },
  {
    href: "/klinik/riwayat",
    label: "Riwayat",
    description: "Arsip konsultasi & booking",
    icon: History,
    accent: "bg-indigo-50 text-indigo-700",
  },
  {
    href: "/klinik/keuangan",
    label: "Keuangan",
    description: "Saldo & pendapatan",
    icon: Wallet,
    accent: "bg-amber-50 text-amber-700",
  },
  {
    href: "/klinik/keuangan/penarikan",
    label: "Tarik Dana",
    description: "Ajukan penarikan saldo",
    icon: ArrowDownToLine,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/klinik/pesan",
    label: "Pesan",
    description: "Chat customer & dokter",
    icon: MessageCircle,
    accent: "bg-blue-50 text-blue-700",
  },
];

export default function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-[#1E6B4F]/30 hover:shadow-md transition-all"
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${action.accent}`}
          >
            <action.icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1E6B4F] transition-colors">
              {action.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
