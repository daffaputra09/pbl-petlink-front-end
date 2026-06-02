"use client";

import { Bell, LogOut } from "lucide-react";
import { useClinicSession } from "@/lib/auth/clinic-session";

export default function Header() {
  const { profile, signOut } = useClinicSession();
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="w-full border-b bg-white px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {profile?.name ?? "Portal Klinik"}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-gray-600">Online</span>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
            aria-label="Notifikasi"
          >
            <Bell size={15} />
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
          >
            <LogOut size={15} />
          </button>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 overflow-hidden"
            title={profile?.name ?? "Klinik"}
          >
            {profile?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.imageUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
