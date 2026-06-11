import { formatBookingRef } from "@/lib/booking/format";
import type { Booking } from "@/types/booking";

export function matchesBookingSearch(
  booking: Booking,
  query: string | undefined
): boolean {
  const q = query?.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    booking.id,
    formatBookingRef(booking.id),
    booking.namaPasien,
    booking.namaPemilik,
    booking.namaDokter ?? "",
    booking.kategori,
    booking.jenis,
    booking.displayLabel ?? "",
    booking.status,
    booking.channel ?? "",
    ...(booking.namaLayanan ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}
