"use client";

import { useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Building2,
  MessageCircle,
  CreditCard,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { ConsultationScheduleDetail } from "@/types/schedule-detail";
import {
  formatCurrency,
  formatDateTimeIndo,
  formatPaymentStatus,
  paymentStatusBadgeClass,
} from "@/lib/booking/format";

type Props = {
  detail: ConsultationScheduleDetail | null;
  loading?: boolean;
  onClose: () => void;
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
          {label}
        </p>
        <div className="text-sm text-gray-800 mt-0.5 font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function ScheduleConsultationDetailModal({
  detail,
  loading,
  onClose,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!detail && !loading) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const start = detail ? new Date(detail.scheduledStartAt) : null;
  const end = detail ? new Date(detail.scheduledEndAt) : null;
  const timeLabel =
    start && end
      ? `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}–${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })} WIB`
      : "—";

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 pr-8">
            <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] flex items-center justify-center">
              <MessageCircle size={18} className="text-[#1565C0]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Detail Konsultasi
              </h2>
              <p className="text-xs text-gray-500">Konsultasi Online</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {loading || !detail ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 size={28} className="animate-spin mb-3" />
              <p className="text-sm">Memuat detail...</p>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#1E6B4F]">
                  {detail.customerName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Konsultasi Online · {detail.clinicName}
                </p>
              </div>

              <div className="rounded-xl border border-[#1565C0]/20 bg-[#E3F2FD]/40 p-4">
                <p className="text-sm font-bold text-[#1565C0]">
                  {detail.displayLabel}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {detail.displayDescription}
                </p>
              </div>

              <InfoRow
                icon={<Calendar size={16} />}
                label="Jadwal"
                value={
                  <div>
                    <p>{formatDateTimeIndo(detail.scheduledStartAt)}</p>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">
                      {timeLabel}
                    </p>
                  </div>
                }
              />

              <InfoRow
                icon={<User size={16} />}
                label="Customer"
                value={
                  <div>
                    <p>{detail.customerName}</p>
                    {detail.customerAddress ? (
                      <p className="text-xs text-gray-500 font-normal mt-0.5">
                        {detail.customerAddress}
                      </p>
                    ) : null}
                  </div>
                }
              />

              {detail.doctorName ? (
                <InfoRow
                  icon={<Building2 size={16} />}
                  label="Dokter"
                  value={detail.doctorName}
                />
              ) : null}

              <InfoRow
                icon={<MessageCircle size={16} />}
                label="Mode"
                value="Konsultasi Online (Chat)"
              />

              <InfoRow
                icon={<CreditCard size={16} />}
                label="Status Pembayaran"
                value={
                  <div>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${paymentStatusBadgeClass(detail.paymentStatus)}`}
                    >
                      {formatPaymentStatus(detail.paymentStatus)}
                    </span>
                    {detail.paymentMethod ? (
                      <p className="text-xs text-gray-500 font-normal mt-1">
                        Metode: {detail.paymentMethod}
                      </p>
                    ) : null}
                    {detail.paidAt ? (
                      <p className="text-xs text-gray-500 font-normal mt-0.5">
                        Dibayar: {formatDateTimeIndo(detail.paidAt)}
                      </p>
                    ) : null}
                  </div>
                }
              />

              {detail.notes ? (
                <InfoRow
                  icon={<FileText size={16} />}
                  label="Catatan"
                  value={detail.notes}
                />
              ) : null}

              {detail.status === "completed" && detail.completedAt ? (
                <InfoRow
                  icon={<CheckCircle2 size={16} />}
                  label="Selesai Pada"
                  value={formatDateTimeIndo(detail.completedAt)}
                />
              ) : null}

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Biaya konsultasi</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">
                    {formatCurrency(detail.consultationFee)}
                  </p>
                </div>
                <Clock size={20} className="text-gray-300" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
