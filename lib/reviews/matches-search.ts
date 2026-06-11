import { formatBookingRef } from "@/lib/booking/format";
import type { AdminReviewItem, ClinicReviewItem } from "@/types/review";

export function matchesReviewSearch(
  item: ClinicReviewItem | AdminReviewItem,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const clinicName =
    "clinicName" in item ? item.clinicName : "";

  const haystack = [
    item.reviewerName,
    item.comment ?? "",
    item.petName ?? "",
    clinicName,
    formatBookingRef(item.bookingId),
    item.bookingId,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}
