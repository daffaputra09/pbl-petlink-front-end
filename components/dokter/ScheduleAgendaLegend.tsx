"use client";

import { Stethoscope } from "lucide-react";
import { SCHEDULE_KIND_STYLES } from "@/lib/dokter/schedule-kind-styles";

type Props = {
  bookingCount: number;
  consultationCount: number;
};

function LegendChip({
  icon: Icon,
  label,
  badgeClass,
  iconClass,
}: {
  icon: typeof Stethoscope;
  label: string;
  badgeClass: string;
  iconClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${badgeClass}`}
    >
      <Icon size={13} className={iconClass} />
      {label}
    </span>
  );
}

export default function ScheduleAgendaLegend({
  bookingCount,
  consultationCount,
}: Props) {
  if (bookingCount === 0 && consultationCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {bookingCount > 0 ? (
        <LegendChip
          icon={SCHEDULE_KIND_STYLES.booking.Icon}
          label={`${bookingCount} Booking`}
          badgeClass={SCHEDULE_KIND_STYLES.booking.badgeClass}
          iconClass={SCHEDULE_KIND_STYLES.booking.iconClass}
        />
      ) : null}
      {consultationCount > 0 ? (
        <LegendChip
          icon={SCHEDULE_KIND_STYLES.consultation.Icon}
          label={`${consultationCount} Konsultasi`}
          badgeClass={SCHEDULE_KIND_STYLES.consultation.badgeClass}
          iconClass={SCHEDULE_KIND_STYLES.consultation.iconClass}
        />
      ) : null}
    </div>
  );
}
