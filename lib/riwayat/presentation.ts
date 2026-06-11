import type { ConsultationHistoryItem } from "@/types/riwayat";
import type { HandlingHistoryEntry } from "@/types/riwayat";

export function matchesConsultationSearch(
  item: ConsultationHistoryItem,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.customerName, item.doctorName, item.petName ?? "", item.displayLabel]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function matchesHandlingSearch(
  item: HandlingHistoryEntry,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    item.doctorName,
    item.referenceTitle,
    item.referenceSubtitle ?? "",
    item.kind,
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function formatRiwayatDateTime(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
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
