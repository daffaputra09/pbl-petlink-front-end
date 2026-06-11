"use client";

import Link from "next/link";
import { PetLinkLogo } from "@/components/brand/PetLinkLogo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseMedical,
  PawPrint as PawIcon,
  Wallet,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { useAdminSession } from "@/lib/auth/admin-session";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Kelola Klinik", icon: BriefcaseMedical, href: "/admin/klinik" },
  { name: "Tipe Hewan", icon: PawIcon, href: "/admin/tipe-hewan" },
  { name: "Penarikan Dana", icon: Wallet, href: "/admin/penarikan" },
  {
    name: "Riwayat Penarikan",
    icon: History,
    href: "/admin/penarikan/riwayat",
  },
  { name: "Pengaturan", icon: Settings, href: "/admin/pengaturan" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAdminSession();

  return (
    <aside className="sticky top-0 z-30 flex h-dvh max-h-dvh w-64 shrink-0 flex-col justify-between overflow-y-auto bg-emerald-700 text-white">
      <div>
        <div className="flex flex-col items-center pt-10 pb-10">
          <PetLinkLogo variant="white" size={72} className="mb-3" />
          <h1 className="text-2xl font-bold tracking-wide">PetLink</h1>
          <p className="text-xs text-emerald-100/80 mt-1">Admin</p>
        </div>

        <nav className="px-4 space-y-1">
          {menus.map(({ name, icon: Icon, href }) => {
            const isActive =
              href === "/admin/penarikan"
                ? pathname === "/admin/penarikan"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium
                  ${
                    isActive
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

      <div className="px-4 py-5 border-t border-emerald-600">
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium text-emerald-100 hover:bg-emerald-600 hover:text-white"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
