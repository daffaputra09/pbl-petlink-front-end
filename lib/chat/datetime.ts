const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function toJakartaWallClock(iso: string | Date) {
  const instant = typeof iso === "string" ? new Date(iso) : iso;
  const j = new Date(instant.getTime() + JAKARTA_OFFSET_MS);
  return {
    year: j.getUTCFullYear(),
    month: j.getUTCMonth(),
    day: j.getUTCDate(),
  };
}

export function isSameCalendarDay(
  a: string | Date,
  b: string | Date
): boolean {
  const wa = toJakartaWallClock(a);
  const wb = toJakartaWallClock(b);
  return wa.year === wb.year && wa.month === wb.month && wa.day === wb.day;
}

const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

function jakartaDayIndex(iso: string | Date): number {
  const { year, month, day } = toJakartaWallClock(iso);
  const utc = new Date(Date.UTC(year, month, day));
  return utc.getUTCDay();
}

function calendarDayDiff(from: string | Date, to: string | Date): number {
  const a = toJakartaWallClock(from);
  const b = toJakartaWallClock(to);
  const fromUtc = Date.UTC(a.year, a.month, a.day);
  const toUtc = Date.UTC(b.year, b.month, b.day);
  return Math.floor((toUtc - fromUtc) / (24 * 60 * 60 * 1000));
}

/** Waktu di list percakapan: hari ini → jam, ≤7 hari → nama hari, >7 hari → tanggal. */
export function formatConversationListTime(iso: string | null | undefined): string {
  if (!iso) return "";

  const date = typeof iso === "string" ? new Date(iso) : iso;
  const now = new Date();

  if (isSameCalendarDay(date, now)) {
    const j = new Date(date.getTime() + JAKARTA_OFFSET_MS);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(j);
  }

  const diffDays = calendarDayDiff(date, now);
  if (diffDays > 0 && diffDays <= 7) {
    return DAY_SHORT[jakartaDayIndex(date)];
  }

  const j = new Date(date.getTime() + JAKARTA_OFFSET_MS);
  const msgYear = j.getUTCFullYear();
  const todayYear = toJakartaWallClock(now).year;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    ...(msgYear !== todayYear ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(j);
}

export function formatChatDateLabel(iso: string | Date): string {
  const msgDay = toJakartaWallClock(iso);
  const today = toJakartaWallClock(new Date());
  const yesterday = new Date(
    Date.UTC(today.year, today.month, today.day - 1)
  );
  const yesterdayDay = {
    year: yesterday.getUTCFullYear(),
    month: yesterday.getUTCMonth(),
    day: yesterday.getUTCDate(),
  };

  if (
    msgDay.year === today.year &&
    msgDay.month === today.month &&
    msgDay.day === today.day
  ) {
    return "Hari ini";
  }

  if (
    msgDay.year === yesterdayDay.year &&
    msgDay.month === yesterdayDay.month &&
    msgDay.day === yesterdayDay.day
  ) {
    return "Kemarin";
  }

  const instant = typeof iso === "string" ? new Date(iso) : iso;
  const j = new Date(instant.getTime() + JAKARTA_OFFSET_MS);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(j);
}
