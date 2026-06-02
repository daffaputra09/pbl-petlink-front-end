"use client";

import { PawPrint } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  HeartHandshake,
  Wallet,
  MessageCircle,
  Settings,
} from "lucide-react";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/klinik/dashboard" },
  { name: "Dokter",    icon: Stethoscope,     href: "/klinik/dokter"    },
  { name: "Booking",   icon: CalendarDays,    href: "/klinik/booking"   },
  { name: "Layanan",   icon: HeartHandshake,  href: "/klinik/layanan"   },
  { name: "Keuangan",  icon: Wallet,          href: "/klinik/keuangan"  },
  { name: "Pesan",     icon: MessageCircle,   href: "/klinik/pesan"     },
];

export default function KlinikSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-30 flex h-dvh max-h-dvh w-64 shrink-0 flex-col justify-between overflow-y-auto bg-emerald-700 text-white">

      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="flex flex-col items-center pt-10 pb-10">
          {}
          <div className="w-16 h-16 flex items-center justify-center mb-3">
            <PawPrint className="w-20 h-20 text-green-200 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">PetLink</h1>
        </div>

        {/* MENU */}
        <nav className="px-4 space-y-1">
          {menus.map(({ name, icon: Icon, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium
                  ${isActive
                    ? "bg-white text-emerald-700"
                    : "text-emerald-100 hover:bg-emerald-600 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM — Pengaturan */}
      <div className="px-4 py-5 border-t border-emerald-600">
        <Link
          href="/klinik/pengaturan"
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium
            ${pathname.startsWith("/klinik/pengaturan")
              ? "bg-white text-emerald-700"
              : "text-emerald-100 hover:bg-emerald-600 hover:text-white"
            }`}
        >
          <Settings size={18} />
          <span>Pengaturan</span>
        </Link>
      </div>
    </aside>
  );
}
