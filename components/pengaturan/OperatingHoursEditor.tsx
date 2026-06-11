"use client";

import { Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { ClinicDayHours } from "@/lib/auth/register-draft";

const DAY_LABELS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

type Props = {
  days: ClinicDayHours[];
  onChange: (days: ClinicDayHours[]) => void;
};

export default function OperatingHoursEditor({ days, onChange }: Props) {
  function updateDay(index: number, patch: Partial<ClinicDayHours>) {
    onChange(days.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  const openCount = days.filter((d) => !d.isClosed).length;

  return (
    <div className="px-5 py-4 space-y-3">
      <p className="text-xs text-gray-500">
        {openCount} hari buka · {7 - openCount} hari tutup
      </p>

      {days.map((day, i) => (
        <div
          key={day.dayOfWeek}
          className={`rounded-xl border p-4 transition-colors ${
            day.isClosed
              ? "border-gray-100 bg-gray-50/60"
              : "border-[#1E6B4F]/15 bg-[#E8F5EE]/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  day.isClosed
                    ? "bg-gray-200 text-gray-500"
                    : "bg-[#1E6B4F] text-white"
                }`}
              >
                {DAY_LABELS[i].slice(0, 3)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {DAY_LABELS[i]}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {day.isClosed
                    ? "Tutup"
                    : `${day.openTime} – ${day.closeTime}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {day.isClosed ? "Tutup" : "Buka"}
              </span>
              <Switch
                checked={!day.isClosed}
                onCheckedChange={(open) => updateDay(i, { isClosed: !open })}
                className="data-[state=checked]:bg-[#1E6B4F]"
              />
            </div>
          </div>

          {!day.isClosed && (
            <div className="flex items-center gap-2 mt-3 pl-[52px]">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <input
                type="time"
                value={day.openTime}
                onChange={(e) => updateDay(i, { openTime: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6B4F]/20 focus:border-[#1E6B4F]/40"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="time"
                value={day.closeTime}
                onChange={(e) => updateDay(i, { closeTime: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6B4F]/20 focus:border-[#1E6B4F]/40"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
