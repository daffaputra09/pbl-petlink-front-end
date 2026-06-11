"use client";

import { ChevronRight, User } from "lucide-react";
import {
  formatScheduleReferenceStatus,
  scheduleKindStyle,
  scheduleStatusBadgeClass,
} from "@/lib/dokter/schedule-kind-styles";
import { formatRiwayatDateTime } from "@/lib/riwayat/presentation";
import type { HandlingHistoryEntry } from "@/types/riwayat";

type Props = {
  entry: HandlingHistoryEntry;
  onClick: () => void;
  loading?: boolean;
};

export default function HandlingHistoryItem({ entry, onClick, loading }: Props) {
  const style = scheduleKindStyle(entry.kind);
  const Icon = style.Icon;
  const { date, time } = formatRiwayatDateTime(entry.startsAt, entry.endsAt);
  const statusLabel = formatScheduleReferenceStatus(
    entry.kind,
    entry.referenceStatus
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition-colors disabled:opacity-60"
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
            <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1 truncate">
              <User size={12} className="shrink-0" />
              Dr. {entry.doctorName}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">{date}</p>
          </div>
          <ChevronRight size={18} className={`shrink-0 mt-2 ${style.iconClass}`} />
        </div>
      </div>
    </button>
  );
}
