"use client";

import { ChevronRight, MessageCircle, User } from "lucide-react";
import { resolveConsultationDisplayStatus } from "@/lib/consultation/display-status";
import { formatRupiah } from "@/lib/keuangan/format";
import { formatRiwayatDateTime } from "@/lib/riwayat/presentation";
import type { ConsultationHistoryItem } from "@/types/riwayat";

type Props = {
  item: ConsultationHistoryItem;
  onClick: () => void;
  loading?: boolean;
};

export default function ConsultationHistoryItem({
  item,
  onClick,
  loading,
}: Props) {
  const { date, time } = formatRiwayatDateTime(
    item.scheduledStartAt,
    item.scheduledEndAt
  );

  const display = resolveConsultationDisplayStatus({
    consultationStatus: item.status,
    paymentStatus: item.paymentStatus,
    scheduledStartAt: new Date(item.scheduledStartAt),
    scheduledEndAt: new Date(item.scheduledEndAt),
  });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full text-left px-5 py-3 hover:bg-gray-50/80 transition-colors disabled:opacity-60"
    >
      <div className="rounded-2xl border border-[#1565C0]/20 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border text-[#1565C0] bg-[#E3F2FD] border-[#1565C0]/25">
            <MessageCircle size={13} />
            Konsultasi
          </span>
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${display.badgeClass}`}
          >
            {item.displayLabel}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center shrink-0">
            <MessageCircle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1565C0]">{time}</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
              {item.customerName}
              {item.petName ? ` · ${item.petName}` : ""}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 inline-flex items-center gap-1 truncate">
              <User size={12} className="shrink-0" />
              Dr. {item.doctorName}
            </p>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <p className="text-[11px] text-gray-400">{date}</p>
              <p className="text-xs font-semibold text-gray-700">
                {formatRupiah(item.consultationFee)}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 mt-2 text-[#1565C0]" />
        </div>
      </div>
    </button>
  );
}
