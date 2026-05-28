"use client";

import { stats } from "@/data/layanan";

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