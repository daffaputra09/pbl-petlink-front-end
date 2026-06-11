"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  Ban,
  Loader2,
} from "lucide-react";
import DoctorTimeOffModal, {
  type DoctorTimeOffFormInput,
} from "@/components/dokter/DoctorTimeOffModal";
import ScheduleAgendaLegend from "@/components/dokter/ScheduleAgendaLegend";
import ScheduleBookedItem from "@/components/dokter/ScheduleBookedItem";
import ScheduleConsultationDetailModal from "@/components/dokter/ScheduleConsultationDetailModal";
import DetailBookingModal from "@/components/booking/DetailBookingModal";
import RescheduleBookingModal from "@/components/booking/RescheduleBookingModal";
import {
  KlinikPageLayout,
  KlinikPageLoading,
  KlinikPrimaryButton,
  KlinikSectionCard,
  KlinikFilterTabs,
} from "@/components/klinik/KlinikPageLayout";
import {
  useClinicDoctorBookedSchedules,
  useClinicDoctors,
} from "@/hooks/use-clinic-doctors";
import { useClinicBookings } from "@/hooks/use-clinic-bookings";
import type { DoctorScheduleEntry } from "@/types/dokter";
import type { Booking, BookingStatus } from "@/types/booking";
import type { ConsultationScheduleDetail } from "@/types/schedule-detail";
import {
  createDoctorTimeOff,
  deleteDoctorTimeOff,
  updateDoctorTimeOff,
} from "@/lib/actions/doctor-time-off";
import {
  fetchClinicScheduleBookingDetail,
  fetchClinicScheduleConsultationDetail,
} from "@/lib/actions/schedule-detail";
import { confirmAction } from "@/lib/ui/confirm-store";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

type JadwalTab = "Libur" | "Terbooking";

function formatRange(startsAt: string, endsAt: string, allDayHint?: boolean) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateFmt: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  if (allDayHint) {
    const endInclusive = new Date(end);
    endInclusive.setDate(endInclusive.getDate() - 1);
    const sameDay = start.toDateString() === endInclusive.toDateString();
    if (sameDay) {
      return start.toLocaleDateString("id-ID", dateFmt);
    }
    return `${start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} – ${endInclusive.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  }

  const date = start.toLocaleDateString("id-ID", dateFmt);
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
  return `${date} · ${t1}–${t2}`;
}

function isAllDayEntry(entry: DoctorScheduleEntry) {
  const start = new Date(entry.startsAt);
  const end = new Date(entry.endsAt);
  return (
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getTime() - start.getTime() >= 23 * 60 * 60 * 1000
  );
}

function toPayload(form: DoctorTimeOffFormInput) {
  return {
    allDay: form.allDay,
    startsAt: form.allDay ? form.startDate : form.startDateTime,
    endsAt: form.allDay ? form.endDate : form.endDateTime,
    notes: form.notes || "Hari libur",
  };
}

function TimeOffItem({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DoctorScheduleEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isPast = new Date(entry.endsAt) < new Date();

  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
          <Ban size={18} className="text-orange-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {formatRange(entry.startsAt, entry.endsAt, isAllDayEntry(entry))}
          </p>
          {entry.notes && entry.notes !== "Hari libur" ? (
            <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>
          ) : null}
          {isPast ? (
            <p className="text-[11px] text-gray-400 mt-1">Sudah lewat</p>
          ) : (
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-[#1E6B4F] hover:bg-emerald-50 rounded-lg"
          title="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
          title="Hapus"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function DoctorProfileCard({
  doctor,
  timeOffCount,
  bookedCount,
  bookingCount,
  consultationCount,
}: {
  doctor: { nama: string; spesialisasi: string; photo?: string; status: string };
  timeOffCount: number;
  bookedCount: number;
  bookingCount: number;
  consultationCount: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
        {doctor.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doctor.photo}
            alt={doctor.nama}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
            {doctor.nama.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold text-gray-900 truncate">
          {doctor.nama}
        </h2>
        <p className="text-sm text-gray-500">{doctor.spesialisasi}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
          <span>
            <span className="font-semibold text-orange-600">{timeOffCount}</span>{" "}
            libur
          </span>
          <span>·</span>
          <span>
            <span className="font-semibold text-[#1E6B4F]">{bookedCount}</span>{" "}
            terbooking
          </span>
          {bookingCount > 0 ? (
            <>
              <span>·</span>
              <span>
                <span className="font-semibold text-[#1E6B4F]">
                  {bookingCount}
                </span>{" "}
                booking
              </span>
            </>
          ) : null}
          {consultationCount > 0 ? (
            <>
              <span>·</span>
              <span>
                <span className="font-semibold text-[#1565C0]">
                  {consultationCount}
                </span>{" "}
                konsultasi
              </span>
            </>
          ) : null}
          <span>·</span>
          <span
            className={`font-medium ${
              doctor.status === "Aktif" ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {doctor.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function JadwalDokterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const { doctors } = useClinicDoctors();
  const { schedules, loading, refresh } = useClinicDoctorBookedSchedules();
  const { updateStatus, reschedule } = useClinicBookings({ listEnabled: false });

  const [tab, setTab] = useState<JadwalTab>("Libur");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<DoctorScheduleEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationScheduleDetail | null>(null);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null
  );

  const doctor = doctors.find((d) => d.id === doctorId);

  const { timeOffEntries, bookedEntries, bookingCount, consultationCount } =
    useMemo(() => {
    if (!doctorId) {
      return {
        timeOffEntries: [],
        bookedEntries: [],
        bookingCount: 0,
        consultationCount: 0,
      };
    }
    const doctorSchedules = schedules.filter((s) => s.doctorId === doctorId);
    const booked = doctorSchedules.filter(
      (s) => s.kind === "booking" || s.kind === "consultation"
    );
    return {
      timeOffEntries: doctorSchedules
        .filter((s) => s.kind === "time_off")
        .sort(
          (a, b) =>
            new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
        ),
      bookedEntries: booked.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
      bookingCount: booked.filter((s) => s.kind === "booking").length,
      consultationCount: booked.filter((s) => s.kind === "consultation").length,
    };
  }, [schedules, doctorId]);

  async function handleBookedClick(entry: DoctorScheduleEntry) {
    if (entry.kind === "booking" && entry.bookingId) {
      setDetailLoadingId(entry.id);
      try {
        const booking = await fetchClinicScheduleBookingDetail(entry.bookingId);
        setSelectedBooking(booking);
      } catch (e) {
        notifyError(
          e instanceof Error ? e.message : "Gagal memuat detail booking"
        );
      } finally {
        setDetailLoadingId(null);
      }
      return;
    }

    if (entry.kind === "consultation" && entry.consultationId) {
      setConsultationLoading(true);
      setSelectedConsultation(null);
      try {
        const detail = await fetchClinicScheduleConsultationDetail(
          entry.consultationId
        );
        setSelectedConsultation(detail);
      } catch (e) {
        notifyError(
          e instanceof Error ? e.message : "Gagal memuat detail konsultasi"
        );
      } finally {
        setConsultationLoading(false);
      }
    }
  }

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateStatus(id, status);
      setSelectedBooking((prev) =>
        prev && prev.id === id ? { ...prev, status } : prev
      );
      await refresh();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal memperbarui status");
    }
  };

  const handleSubmitReschedule = async (
    id: string,
    tanggal: string,
    jamMulai: string,
    jamSelesai: string
  ) => {
    try {
      await reschedule(id, tanggal, jamMulai, jamSelesai);
      setRescheduleBooking(null);
      setSelectedBooking(null);
      await refresh();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menjadwalkan ulang");
    }
  };

  async function handleSave(form: DoctorTimeOffFormInput) {
    if (!doctorId) return;
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editEntry) {
        await updateDoctorTimeOff(editEntry.id, payload);
        notifySuccess("Jadwal libur diperbarui.");
      } else {
        await createDoctorTimeOff({ doctorId, ...payload });
        notifySuccess("Jadwal libur ditambahkan.");
      }
      setModalOpen(false);
      setEditEntry(null);
      await refresh();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menyimpan hari libur");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry: DoctorScheduleEntry) {
    const ok = await confirmAction({
      title: "Hapus jadwal libur?",
      message: "Dokter akan bisa dibooking lagi pada rentang waktu ini.",
      confirmLabel: "Hapus",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteDoctorTimeOff(entry.id);
      await refresh();
      notifySuccess("Jadwal libur dihapus.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  if (!doctorId) {
    return (
      <KlinikPageLayout
        title="Jadwal Dokter"
        description="Pilih dokter dari daftar dokter terlebih dahulu"
        backHref="/klinik/dokter"
        backLabel="Kembali ke Dokter"
      >
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            Buka halaman Dokter dan klik tombol{" "}
            <strong className="text-gray-700">Jadwal</strong> pada baris dokter
            yang ingin dikelola.
          </p>
          <button
            type="button"
            onClick={() => router.push("/klinik/dokter")}
            className="mt-4 text-sm font-semibold text-[#1E6B4F] hover:underline"
          >
            Ke Daftar Dokter
          </button>
        </div>
      </KlinikPageLayout>
    );
  }

  return (
    <KlinikPageLayout
      title="Jadwal Dokter"
      description="Kelola hari libur dan lihat slot terbooking"
      backHref="/klinik/dokter"
      backLabel="Kembali ke Dokter"
      actions={
        tab === "Libur" ? (
          <KlinikPrimaryButton
            icon={<Plus size={16} />}
            onClick={() => {
              setEditEntry(null);
              setModalOpen(true);
            }}
          >
            Tambah Libur
          </KlinikPrimaryButton>
        ) : undefined
      }
    >
      {doctor ? (
        <DoctorProfileCard
          doctor={doctor}
          timeOffCount={timeOffEntries.length}
          bookedCount={bookedEntries.length}
          bookingCount={bookingCount}
          consultationCount={consultationCount}
        />
      ) : null}

      <KlinikFilterTabs
        tabs={["Libur", "Terbooking"] as const}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <KlinikPageLoading message="Memuat jadwal..." />
      ) : tab === "Libur" ? (
        <KlinikSectionCard
          title="Hari Libur"
          description={`${timeOffEntries.length} rentang waktu — dokter tidak bisa dipesan`}
        >
          {timeOffEntries.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-6 text-center">
              <Ban size={28} className="text-orange-300 mb-3" />
              <p className="text-sm text-gray-500">
                Belum ada hari libur. Tambahkan rentang tanggal agar dokter tidak
                bisa dipesan customer.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditEntry(null);
                  setModalOpen(true);
                }}
                className="mt-4 text-sm font-semibold text-[#1E6B4F] hover:underline"
              >
                + Tambah hari libur
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {timeOffEntries.map((entry) => (
                <TimeOffItem
                  key={entry.id}
                  entry={entry}
                  onEdit={() => {
                    setEditEntry(entry);
                    setModalOpen(true);
                  }}
                  onDelete={() => void handleDelete(entry)}
                />
              ))}
            </div>
          )}
        </KlinikSectionCard>
      ) : (
        <KlinikSectionCard
          title="Slot Terbooking"
          description={`${bookedEntries.length} slot — otomatis dari booking & konsultasi`}
          actions={
            bookedEntries.length > 0 ? (
              <ScheduleAgendaLegend
                bookingCount={bookingCount}
                consultationCount={consultationCount}
              />
            ) : undefined
          }
        >
          {bookedEntries.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-6 text-center">
              <CalendarDays size={28} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Belum ada slot terbooking untuk dokter ini.
              </p>
            </div>
          ) : (
            <div className="space-y-1 pb-2">
              {bookedEntries.map((entry) => (
                <ScheduleBookedItem
                  key={entry.id}
                  entry={entry}
                  loading={detailLoadingId === entry.id}
                  onClick={() => void handleBookedClick(entry)}
                />
              ))}
            </div>
          )}
        </KlinikSectionCard>
      )}

      <DoctorTimeOffModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditEntry(null);
        }}
        onSave={handleSave}
        editData={editEntry}
        saving={saving}
      />

      {selectedBooking ? (
        <DetailBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
          onReschedule={(id) => {
            const b =
              selectedBooking.id === id
                ? selectedBooking
                : null;
            if (b) {
              setSelectedBooking(null);
              setRescheduleBooking(b);
            }
          }}
          onCancel={(id) => handleUpdateStatus(id, "Dibatalkan")}
        />
      ) : null}

      {rescheduleBooking ? (
        <RescheduleBookingModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSubmit={handleSubmitReschedule}
        />
      ) : null}

      {(selectedConsultation || consultationLoading) ? (
        <ScheduleConsultationDetailModal
          detail={selectedConsultation}
          loading={consultationLoading}
          onClose={() => {
            setSelectedConsultation(null);
            setConsultationLoading(false);
          }}
        />
      ) : null}

      {detailLoadingId ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 text-sm text-gray-600">
            <Loader2 size={18} className="animate-spin text-[#1E6B4F]" />
            Memuat detail...
          </div>
        </div>
      ) : null}
    </KlinikPageLayout>
  );
}
