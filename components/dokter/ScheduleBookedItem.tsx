"use client";

import { ChevronRight } from "lucide-react";
import type { DoctorScheduleEntry } from "@/types/dokter";
import {
  formatScheduleReferenceStatus,
  scheduleKindStyle,
  scheduleStatusBadgeClass,
} from "@/lib/dokter/schedule-kind-styles";

function formatTimeRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = start.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const t1 = start.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const t2 = end.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time: `${t1}–${t2}` };
}

type Props = {
  entry: DoctorScheduleEntry;
  onClick: () => void;
  loading?: boolean;
};

export default function ScheduleBookedItem({ entry, onClick, loading }: Props) {
  const style = scheduleKindStyle(entry.kind);
  const Icon = style.Icon;
  const { date, time } = formatTimeRange(entry.startsAt, entry.endsAt);
  const statusLabel = formatScheduleReferenceStatus(
    entry.kind,
    entry.referenceStatus
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full text-left px-5 py-4 transition-colors hover:bg-gray-50/80 disabled:opacity-60`}
    >
      <div
        className={`rounded-2xl border bg-white p-4 shadow-sm ${style.borderClass}`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${style.badgeClass}`}
          >
            <Icon size={13} />
            {style.label}
          </span>
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${scheduleStatusBadgeClass(entry.kind, entry.referenceStatus)}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBgClass}`}
          >
            <Icon size={20} className={style.iconClass} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold ${style.iconClass}`}>{time}</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
              {entry.referenceTitle}
            </p>
            {entry.referenceSubtitle ? (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {entry.referenceSubtitle}
              </p>
            ) : null}
            <p className="text-[11px] text-gray-400 mt-1">{date}</p>
          </div>
          <ChevronRight size={18} className={`shrink-0 mt-2 ${style.iconClass}`} />
        </div>
      </div>
    </button>
  );
}
