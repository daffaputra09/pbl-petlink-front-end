"use client";

import { BriefcaseMedical, Clock, TrendingUp } from "lucide-react";
import type { ServiceStatItem } from "@/types/layanan";

const ICONS = {
  total: BriefcaseMedical,
  price: TrendingUp,
  duration: Clock,
} as const;

const ICON_BG = {
  total: "bg-emerald-50 text-emerald-600",
  price: "bg-violet-50 text-violet-600",
  duration: "bg-blue-50 text-blue-600",
} as const;

export default function ServiceStatCard({ stats }: { stats: ServiceStatItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = ICONS[stat.iconKey];
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2.5 rounded-xl ${ICON_BG[stat.iconKey]}`}
              >
                <Icon size={20} />
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stat.badgeClass}`}
              >
                {stat.badge}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
