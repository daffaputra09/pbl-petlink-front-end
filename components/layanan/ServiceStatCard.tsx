"use client";

import {
  BriefcaseMedical,
  CalendarCheck2,
  TrendingUp,
} from "lucide-react";

interface Stat {
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
  isLarge?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

const stats: Stat[] = [
  {
    label: "TOTAL LAYANAN",
    value: "24",
    badge: "+2 bulan",
    badgeColor: "text-emerald-600 bg-emerald-50",
    icon: <BriefcaseMedical className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-50",
  },
  {
    label: "BOOKING AKTIF",
    value: "148",
    badge: "Trend Tertinggi",
    badgeColor: "text-white bg-emerald-500",
    icon: <CalendarCheck2 className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    label: "LAYANAN POPULER",
    value: "Vaksinasi",
    badge: "Trending",
    badgeColor: "text-orange-600 bg-orange-50",
    isLarge: true,
    icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
    iconBg: "bg-orange-50",
  },
];

export default function ServiceStatCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div
              className={`${stat.iconBg} w-11 h-11 rounded-xl flex items-center justify-center`}
            >
              {stat.icon}
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.badgeColor}`}
            >
              {stat.badge}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              {stat.label}
            </span>

            <span
              className={`font-bold text-gray-800 ${
                stat.isLarge ? "text-2xl" : "text-3xl"
              }`}
            >
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}