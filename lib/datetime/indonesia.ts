/** Petlink clinic/customer schedules are shown in Western Indonesia Time. */
export const APP_TIME_ZONE = "Asia/Jakarta";

export function formatDateYmdInAppTz(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeInAppTz(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  });
}

export function formatDateInAppTz(
  iso: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    ...options,
    timeZone: APP_TIME_ZONE,
  });
}

export function formatDateTimeInAppTz(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  });
}
