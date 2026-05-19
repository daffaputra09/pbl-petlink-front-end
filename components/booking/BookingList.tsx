import { Booking } from "@/app/klinik/booking/page";
import BookingCard from "./BookingCard";

type Props = {
  bookings: Booking[];
};

export default function BookingList({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-3">📋</span>
        <p className="text-sm">Tidak ada booking ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
