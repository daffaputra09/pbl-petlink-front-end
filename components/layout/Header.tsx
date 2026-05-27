"use client";

import {
  Search,
  SunMedium,
  Bell,
} from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b bg-white px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />

          <input
            type="text"
            placeholder="Cari layanan..."
            className="
              w-full rounded-lg border border-gray-200
              bg-gray-50 py-2 pl-9 pr-3
              text-xs text-gray-700
              outline-none transition-all
              focus:border-emerald-500
              focus:bg-white
            "
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Online */}
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-gray-600">Online</span>
          </div>

          {/* Theme */}
          <button
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg border border-gray-200
              text-gray-500 transition
              hover:bg-gray-100
            "
          >
            <SunMedium size={15} />
          </button>

          {/* Notification */}
          <button
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg border border-gray-200
              text-gray-500 transition
              hover:bg-gray-100
            "
          >
            <Bell size={15} />
          </button>

          {/* Profile */}
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full bg-gray-200
              text-xs font-semibold text-gray-700
            "
          >
            DS
          </div>
        </div>
      </div>
    </header>
  );
}