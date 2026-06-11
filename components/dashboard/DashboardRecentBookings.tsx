"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, Home, Stethoscope } from "lucide-react";
import type { DashboardRecentBooking } from "@/types/dashboard";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { channelLabel, formatDateTimeIndo } from "@/lib/booking/format";
import { displayKindToSemantic } from "@/lib/booking/status-theme";
import { KlinikSectionCard } from "@/components/klinik/KlinikPageLayout";

type Props = {
  bookings: DashboardRecentBooking[];
};

export default function DashboardRecentBookings({ bookings }: Props) {
  return (
    <KlinikSectionCard
      title="Booking Mendatang"
      description="Janji temu terdekat yang perlu dipersiapkan"
      actions={
        <Link
          href="/klinik/booking"
          className="text-xs font-semibold text-[#1E6B4F] hover:underline inline-flex items-center gap-1"
        >
          Lihat semua
          <ArrowRight size={14} />
        </Link>
      }
    >
      <div className="divide-y divide-gray-50">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <Calendar size={28} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Tidak ada booking mendatang saat ini.
            </p>
          </div>
        ) : (
          bookings.map((b) => {
            const isHome = b.channel === "home";
            return (
              <Link
                key={b.id}
                href="/klinik/booking"
                className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#1E6B4F] flex items-center justify-center shrink-0">
                  {isHome ? <Home size={18} /> : <Stethoscope size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {b.patientName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {b.ownerName} · {channelLabel(b.channel)}
                      </p>
                    </div>
                    <BookingStatusBadge
                      label={b.statusLabel}
                      semantic={displayKindToSemantic(b.displayKind ?? "terjadwal")}
                      className="text-[10px] uppercase tracking-wide shrink-0"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 inline-flex items-center gap-1">
                    <Clock size={12} />
                    {formatDateTimeIndo(b.scheduledAt)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </KlinikSectionCard>
  );
}
