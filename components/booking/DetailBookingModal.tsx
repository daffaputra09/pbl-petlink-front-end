"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  User,
  Stethoscope,
  CreditCard,
  FileText,
  Navigation,
  Home,
  Calendar,
  Clock,
  Hash,
  Wrench,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Booking } from "@/types/booking";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { displayKindToSemantic } from "@/lib/booking/status-theme";
import {
  type BookingDbStatus,
  canClinicAssignDoctor,
  canClinicReschedule,
  getClinicStatusTransitions,
} from "@/lib/booking/clinic-status-transitions";
import { googleMapsDirectionsUrl } from "@/lib/booking/visit-address";
import { getCustomerContact } from "@/lib/actions/lookup-customer";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { findOrCreateClinicCustomerThread } from "@/lib/chat/clinic-customer-chat";
import { findOrCreateClinicDoctorThread } from "@/lib/chat/clinic-doctor-chat";
import { buildPesanUrl } from "@/lib/chat/pesan-url";
import { notifyError } from "@/lib/ui/notify";
import {
  channelLabel,
  formatBookingRef,
  formatCurrency,
  formatDateTimeIndo,
  formatDurationMinutes,
  formatPaymentStatus,
  formatTanggalIndo,
  paymentStatusBadgeClass,
} from "@/lib/booking/format";

type Props = {
  booking: Booking;
  onClose: () => void;
  onUpdateBookingStatus: (
    id: string,
    status: BookingDbStatus
  ) => Promise<void>;
  onReschedule: (id: string) => void;
  onAssignDoctor: (id: string) => void;
};

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
          {label}
        </p>
        <p
          className={`text-sm text-gray-800 mt-0.5 break-words ${
            mono ? "font-mono text-xs" : "font-medium"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function DetailBookingModal({
  booking,
  onClose,
  onUpdateBookingStatus,
  onReschedule,
  onAssignDoctor,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { profile } = useClinicSession();
  const [contactLoading, setContactLoading] = useState(false);
  const [chatCustomerLoading, setChatCustomerLoading] = useState(false);
  const [chatDoctorLoading, setChatDoctorLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingDbStatus | "">(
    ""
  );
  const [email, setEmail] = useState(booking.emailPemilik);
  const [phone, setPhone] = useState(booking.telpPemilik);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setEmail(booking.emailPemilik);
    setPhone(booking.telpPemilik);
  }, [booking]);

  useEffect(() => {
    if (!booking.customerId) return;
    if (booking.emailPemilik !== "-" && booking.telpPemilik !== "-") return;

    let cancelled = false;
    setContactLoading(true);
    void getCustomerContact(booking.customerId)
      .then((c) => {
        if (cancelled) return;
        if (c.email) setEmail(c.email);
        if (c.phone) setPhone(c.phone);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setContactLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [booking.customerId, booking.emailPemilik, booking.telpPemilik]);

  const displayLabel = booking.displayLabel ?? booking.status;
  const isHome = booking.channel === "home";
  const statusTransitions = getClinicStatusTransitions(booking);
  const selectedTransition = statusTransitions.find(
    (t) => t.value === selectedStatus
  );
  const canReschedule = canClinicReschedule(booking);
  const canAssignDoctor = canClinicAssignDoctor(booking);

  const directionsUrl = isHome
    ? googleMapsDirectionsUrl({
        latitude: booking.visitLatitude,
        longitude: booking.visitLongitude,
        address: booking.visitAddress,
      })
    : null;

  const catatanTampil = booking.catatanCustomer ?? booking.catatan;

  async function handleChatCustomer() {
    if (!booking.customerId) {
      notifyError("Data customer tidak tersedia untuk booking ini.");
      return;
    }
    if (!profile?.id) {
      notifyError("Sesi klinik tidak valid.");
      return;
    }
    setChatCustomerLoading(true);
    try {
      const threadId = await findOrCreateClinicCustomerThread(
        profile.id,
        booking.customerId
      );
      onClose();
      router.push(buildPesanUrl({ threadId, tab: "Customers" }));
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal membuka chat");
    } finally {
      setChatCustomerLoading(false);
    }
  }

  async function handleStatusUpdate() {
    if (!selectedStatus) return;
    const transition = statusTransitions.find((t) => t.value === selectedStatus);
    if (!transition) return;

    const confirmMessage = transition.destructive
      ? "Batalkan booking ini? Slot dokter akan dilepas."
      : `Ubah status menjadi "${transition.label}"?`;

    if (!window.confirm(confirmMessage)) return;

    setStatusUpdating(true);
    try {
      await onUpdateBookingStatus(booking.id, selectedStatus);
      setSelectedStatus("");
      onClose();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal memperbarui status");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleChatDoctor() {
    if (!booking.doctorId) {
      notifyError("Dokter belum ditentukan untuk booking ini.");
      return;
    }
    if (!profile?.id) {
      notifyError("Sesi klinik tidak valid.");
      return;
    }
    setChatDoctorLoading(true);
    try {
      const threadId = await findOrCreateClinicDoctorThread(
        profile.id,
        booking.doctorId
      );
      onClose();
      router.push(buildPesanUrl({ threadId, tab: "Doctors" }));
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal membuka chat dokter");
    } finally {
      setChatDoctorLoading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>

          <div className="flex flex-wrap items-center gap-2 pr-8">
            <BookingStatusBadge
              label={displayLabel}
              semantic={displayKindToSemantic(booking.displayKind ?? "terjadwal")}
            />
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isHome
                  ? "bg-violet-50 text-violet-700 border border-violet-100"
                  : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}
            >
              {isHome ? (
                <span className="inline-flex items-center gap-1">
                  <Home size={12} />
                  {channelLabel(booking.channel)}
                </span>
              ) : (
                channelLabel(booking.channel)
              )}
            </span>
            <span className="text-xs font-mono text-gray-400">
              #{formatBookingRef(booking.id)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            {booking.namaPasien}
          </h2>
          <p className="text-sm text-gray-500">
            {booking.kategori}
            {booking.jenis !== "-" ? ` · ${booking.jenis}` : ""} · {booking.usia}{" "}
            · {booking.jenisKelamin}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {isHome && booking.displayKind === "menungguCheckIn" && (
            <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 text-sm text-amber-800">
              Menunggu dokter check-in di lokasi customer. Status berlangsung
              dimulai setelah check-in GPS.
            </div>
          )}

          {!isHome && booking.rawStatus === "in_progress" && (
            <div className="bg-sky-50 rounded-xl px-4 py-3 border border-sky-100 text-sm text-sky-800">
              Kunjungan klinik sedang berlangsung. Dokter dapat memulai dari
              aplikasi atau klinik dapat menandai status secara manual.
            </div>
          )}

          {booking.checkedInAt && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100 text-sm text-emerald-800">
              Dokter sudah check-in pada{" "}
              {formatDateTimeIndo(booking.checkedInAt)}.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Jadwal
              </p>
              <InfoRow
                icon={<Calendar size={15} />}
                label="Tanggal"
                value={formatTanggalIndo(booking.tanggal)}
              />
              <InfoRow
                icon={<Clock size={15} />}
                label="Waktu"
                value={`${booking.jamMulai} – ${booking.jamSelesai}`}
              />
              {booking.durationMinutes ? (
                <InfoRow
                  icon={<Clock size={15} />}
                  label="Durasi"
                  value={formatDurationMinutes(booking.durationMinutes)}
                />
              ) : null}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Tim & channel
              </p>
              <InfoRow
                icon={<Stethoscope size={15} />}
                label="Dokter"
                value={booking.namaDokter ?? "Belum ditentukan"}
              />
              <InfoRow
                icon={<User size={15} />}
                label="Pemilik"
                value={booking.namaPemilik}
              />
            </div>
          </div>

          {(booking.layanan?.length ?? 0) > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Wrench size={14} className="text-emerald-600" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Layanan
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {booking.layanan!.map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.quantity}x · {formatDurationMinutes(item.durationMinutes)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 shrink-0">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
              {(booking.totalAmount ?? 0) > 0 && (
                <div className="px-4 py-3 bg-emerald-50/50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Total
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Pembayaran
            </p>
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${paymentStatusBadgeClass(booking.paymentStatus)}`}
              >
                {formatPaymentStatus(booking.paymentStatus)}
              </span>
              {(booking.paymentAmount ?? booking.totalAmount ?? 0) > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                  {formatCurrency(booking.paymentAmount ?? booking.totalAmount)}
                </span>
              )}
            </div>
            {booking.paidAt ? (
              <InfoRow
                icon={<CreditCard size={15} />}
                label="Dibayar pada"
                value={formatDateTimeIndo(booking.paidAt)}
              />
            ) : null}
            {booking.paymentMethod ? (
              <InfoRow
                icon={<CreditCard size={15} />}
                label="Metode"
                value={booking.paymentMethod}
              />
            ) : null}
            {booking.midtransOrderId ? (
              <InfoRow
                icon={<Hash size={15} />}
                label="Order ID"
                value={booking.midtransOrderId}
                mono
              />
            ) : null}
          </div>

          {catatanTampil ? (
            <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              <div className="flex items-start gap-3">
                <FileText size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-amber-600 font-medium">
                    Catatan
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line mt-1">
                    {catatanTampil}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isHome && booking.visitAddress ? (
            <div className="bg-violet-50 rounded-xl px-4 py-3 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-violet-600 shrink-0" />
                <p className="text-[11px] uppercase tracking-wide text-violet-600 font-medium">
                  Alamat Kunjungan
                </p>
              </div>
              <p className="text-sm text-gray-700 mb-3">{booking.visitAddress}</p>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
                >
                  <Navigation size={14} />
                  Buka petunjuk arah
                </a>
              )}
            </div>
          ) : null}

          <div className="border border-gray-100 rounded-xl px-4 py-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Kontak Pemilik
            </p>
            <InfoRow
              icon={<MapPin size={15} />}
              label="Alamat"
              value={booking.alamatPemilik !== "-" ? booking.alamatPemilik : "—"}
            />
            <InfoRow
              icon={<Mail size={15} />}
              label="Email"
              value={
                contactLoading && email === "-"
                  ? "Memuat..."
                  : email !== "-"
                    ? email
                    : "—"
              }
            />
            <InfoRow
              icon={<Phone size={15} />}
              label="Telepon"
              value={
                contactLoading && phone === "-"
                  ? "Memuat..."
                  : phone !== "-"
                    ? phone
                    : "—"
              }
            />
            {booking.createdAt ? (
              <InfoRow
                icon={<Calendar size={15} />}
                label="Dibuat"
                value={formatDateTimeIndo(booking.createdAt)}
              />
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 space-y-3 border-t border-gray-100 shrink-0">
          {booking.customerId || booking.doctorId ? (
            <div
              className={`grid gap-2 ${
                booking.customerId && booking.doctorId
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {booking.customerId ? (
                <button
                  type="button"
                  onClick={() => void handleChatCustomer()}
                  disabled={chatCustomerLoading || chatDoctorLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-60"
                >
                  {chatCustomerLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                  <span className="truncate">
                    Chat{" "}
                    {booking.namaPemilik !== "-"
                      ? booking.namaPemilik
                      : "Customer"}
                  </span>
                </button>
              ) : null}
              {booking.doctorId ? (
                <button
                  type="button"
                  onClick={() => void handleChatDoctor()}
                  disabled={chatCustomerLoading || chatDoctorLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-sm font-semibold hover:bg-sky-100 transition-colors disabled:opacity-60"
                >
                  {chatDoctorLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Stethoscope size={16} />
                  )}
                  <span className="truncate">
                    Chat{" "}
                    {booking.namaDokter?.trim()
                      ? booking.namaDokter
                      : "Dokter"}
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}

          {statusTransitions.length > 0 && (
            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Perbarui status
              </p>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as BookingDbStatus | "")
                }
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 outline-none"
              >
                <option value="">— Pilih status baru —</option>
                {statusTransitions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {selectedTransition?.description ? (
                <p className="text-xs text-gray-500">
                  {selectedTransition.description}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleStatusUpdate()}
                disabled={!selectedStatus || statusUpdating}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                  selectedTransition?.destructive
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {statusUpdating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Terapkan status
              </button>
            </div>
          )}

          {(canReschedule || canAssignDoctor) && (
            <div
              className={`grid gap-3 ${
                canReschedule && canAssignDoctor ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {canReschedule ? (
                <button
                  type="button"
                  onClick={() => onReschedule(booking.id)}
                  className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reschedule
                </button>
              ) : null}
              {canAssignDoctor ? (
                <button
                  type="button"
                  onClick={() => onAssignDoctor(booking.id)}
                  className="py-3 rounded-xl border border-sky-200 text-sm font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
                >
                  Ubah dokter
                </button>
              ) : null}
            </div>
          )}

          {statusTransitions.length === 0 &&
            !canReschedule &&
            !canAssignDoctor && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
