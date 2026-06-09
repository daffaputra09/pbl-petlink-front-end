import { Booking } from "@/types/booking";
import { displayStatusBadgeClass } from "@/lib/booking/display-status";

type Props = {
  booking: Booking;
  onClick: (booking: Booking) => void;
};

function formatTanggal(tanggal: string): string {
  const [y, m, d] = tanggal.split("-");
  if (d && m && y) return `${d}/${m}/${y}`;
  return tanggal;
}

export default function BookingCard({ booking, onClick }: Props) {
  const label = booking.displayLabel ?? booking.status;
  const className = displayStatusBadgeClass(
    booking.displayKind ?? "terjadwal"
  );
  const isHome = booking.channel === "home";

  return (
    <button
      onClick={() => onClick(booking)}
      className="w-full text-left flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-md hover:border-emerald-100 transition-all duration-150 cursor-pointer"
    >
      {/* Left: Pet Info */}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800">
            {booking.namaPasien}
          </p>
          {isHome && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
              Home Service
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {booking.jenis} • {booking.usia}
        </p>
      </div>

      {/* Right: Time + Status */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">
            {booking.jamMulai} - {booking.jamSelesai}
          </p>
          <p className="text-xs text-gray-400"> {formatTanggal(booking.tanggal)} </p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-md whitespace-nowrap ${className}`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
