import { Booking } from "@/app/klinik/booking/page";

type Props = {
  booking: Booking;
};

const statusConfig: Record<
  Booking["status"],
  { label: string; className: string }
> = {
  Terjadwal: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  Selesai: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  Dibatalkan: {
    label: "Dibatalkan",
    className: "bg-red-50 text-red-500 border border-red-100",
  },
};

export default function BookingCard({ booking }: Props) {
  const { label, className } = statusConfig[booking.status];

  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow">
      {/* Left: Pet Info */}
      <div>
        <p className="text-sm font-semibold text-gray-800">{booking.namaPasien}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {booking.ras} • {booking.usia}
        </p>
      </div>

      {/* Right: Time + Status */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">
            {booking.jamMulai} - {booking.jamSelesai}
          </p>
          <p className="text-xs text-gray-400">{booking.tanggal}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-md whitespace-nowrap ${className}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
