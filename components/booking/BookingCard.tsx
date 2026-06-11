import {
  Calendar,
  Clock,
  CreditCard,
  Home,
  MapPin,
  Stethoscope,
  User,
  Wrench,
} from "lucide-react";
import { Booking } from "@/types/booking";
import { displayStatusBadgeClass } from "@/lib/booking/display-status";
import {
  channelLabel,
  formatBookingRef,
  formatCurrency,
  formatPaymentStatus,
  formatTanggalIndo,
  paymentStatusBadgeClass,
} from "@/lib/booking/format";

type Props = {
  booking: Booking;
  onClick: (booking: Booking) => void;
};

function servicesSummary(booking: Booking): string {
  const names = booking.namaLayanan ?? [];
  if (names.length === 0) return "Tanpa layanan";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1} layanan`;
}

export default function BookingCard({ booking, onClick }: Props) {
  const label = booking.displayLabel ?? booking.status;
  const statusClass = displayStatusBadgeClass(
    booking.displayKind ?? "terjadwal"
  );
  const isHome = booking.channel === "home";
  const paymentLabel = formatPaymentStatus(booking.paymentStatus);
  const paymentClass = paymentStatusBadgeClass(booking.paymentStatus);

  return (
    <button
      type="button"
      onClick={() => onClick(booking)}
      className="w-full text-left bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-md hover:border-emerald-100 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              isHome
                ? "bg-violet-50 text-violet-700 border border-violet-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}
          >
            {isHome ? (
              <span className="inline-flex items-center gap-1">
                <Home size={10} />
                {channelLabel(booking.channel)}
              </span>
            ) : (
              channelLabel(booking.channel)
            )}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass}`}
          >
            {label}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-gray-400">
            #{formatBookingRef(booking.id)}
          </p>
          {(booking.totalAmount ?? 0) > 0 && (
            <p className="text-sm font-bold text-gray-800 mt-0.5">
              {formatCurrency(booking.totalAmount)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
        <div className="space-y-2 min-w-0">
          <div>
            <p className="text-base font-semibold text-gray-900 truncate">
              {booking.namaPasien}
              <span className="text-sm font-normal text-gray-400 ml-2">
                {booking.kategori}
                {booking.jenis !== "-" ? ` · ${booking.jenis}` : ""}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {booking.usia} · {booking.jenisKelamin}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <User size={12} className="text-gray-400 shrink-0" />
              {booking.namaPemilik}
            </span>
            {booking.namaDokter ? (
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope size={12} className="text-emerald-600 shrink-0" />
                {booking.namaDokter}
              </span>
            ) : (
              <span className="text-gray-400 italic">Dokter belum ditentukan</span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Wrench size={12} className="text-gray-400 shrink-0" />
              {servicesSummary(booking)}
            </span>
          </div>

          {isHome && booking.visitAddress ? (
            <p className="text-xs text-violet-700 inline-flex items-start gap-1 line-clamp-1">
              <MapPin size={12} className="shrink-0 mt-0.5" />
              {booking.visitAddress}
            </p>
          ) : null}
        </div>

        <div className="md:text-right space-y-2 shrink-0">
          <div>
            <p className="text-xs text-gray-400 inline-flex items-center gap-1 md:justify-end">
              <Calendar size={12} />
              {formatTanggalIndo(booking.tanggal)}
            </p>
            <p className="text-sm font-semibold text-gray-800 inline-flex items-center gap-1 md:justify-end mt-0.5">
              <Clock size={13} className="text-gray-400" />
              {booking.jamMulai} – {booking.jamSelesai}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${paymentClass}`}
          >
            <CreditCard size={11} />
            {paymentLabel}
          </span>
        </div>
      </div>
    </button>
  );
}
