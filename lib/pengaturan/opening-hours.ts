import type { ClinicDayHours } from "@/lib/auth/register-draft";
import { defaultOperatingHours } from "@/lib/auth/register-draft";

type PeriodRow = {
  opens_at: string;
  closes_at: string;
  sort_order?: number;
};

type OpeningHoursRow = {
  day_of_week: number;
  is_closed: boolean;
  clinic_opening_hour_periods:
    | PeriodRow
    | PeriodRow[]
    | null;
};

function parseDbTime(value: string): string {
  return value.slice(0, 5);
}

function firstPeriod(row: OpeningHoursRow): PeriodRow | null {
  const periods = row.clinic_opening_hour_periods;
  if (!periods) return null;
  const list = Array.isArray(periods) ? periods : [periods];
  if (list.length === 0) return null;
  return [...list].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )[0];
}

export function mapOpeningHoursFromDb(
  rows: OpeningHoursRow[] | null | undefined
): ClinicDayHours[] {
  const defaults = defaultOperatingHours();
  if (!rows?.length) return defaults;

  return defaults.map((fallback) => {
    const row = rows.find((r) => r.day_of_week === fallback.dayOfWeek);
    if (!row) return fallback;

    const period = firstPeriod(row);
    return {
      dayOfWeek: row.day_of_week,
      isClosed: row.is_closed,
      openTime: period ? parseDbTime(period.opens_at) : fallback.openTime,
      closeTime: period ? parseDbTime(period.closes_at) : fallback.closeTime,
    };
  });
}
