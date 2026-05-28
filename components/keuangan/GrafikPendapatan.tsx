"use client";

import { DataGrafik } from "@/types/keuangan";

interface GrafikPendapatanProps {
  data: DataGrafik[];
}

function formatJuta(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
  return `${val}`;
}

export default function GrafikPendapatan({ data }: GrafikPendapatanProps) {
  const max = Math.max(...data.map((d) => d.pendapatan));
  const today = new Date().getDay(); // 0=Sun,1=Mon...
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // map JS day to index (Sen=0...Min=6)
  const todayIndex = dayMap[today];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Pendapatan Mingguan</h3>
          <p className="text-xs text-gray-400 mt-0.5">7 hari terakhir</p>
        </div>
        <span className="text-xs bg-[#E8F5EE] text-[#1E6B4F] font-medium px-3 py-1 rounded-full">
          Minggu Ini
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-36">
        {data.map((item, i) => {
          const heightPct = (item.pendapatan / max) * 100;
          const isToday = i === todayIndex;
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-[#1E6B4F] whitespace-nowrap">
                {formatJuta(item.pendapatan)}
              </div>
              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: "100px" }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isToday
                      ? "bg-[#1E6B4F]"
                      : "bg-[#C8E6D4] group-hover:bg-[#4CAF82]"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              {/* Label */}
              <span className={`text-[11px] font-medium ${isToday ? "text-[#1E6B4F]" : "text-gray-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
