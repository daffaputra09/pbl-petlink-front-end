import { statusBadgeClass, type BookingStatusSemantic } from "@/lib/booking/status-theme";

type Props = {
  label: string;
  semantic: BookingStatusSemantic;
  className?: string;
};

export default function BookingStatusBadge({
  label,
  semantic,
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadgeClass(semantic)} ${className}`}
    >
      {label}
    </span>
  );
}
