"use client";

import { useMemo, useState } from "react";
import {
  Download,
  CalendarDays,
  Clock,
  CheckCircle2,
  Banknote,
  Search,
  X,
} from "lucide-react";
import BookingList from "@/components/booking/BookingList";
import DetailBookingModal from "@/components/booking/DetailBookingModal";
import RescheduleBookingModal from "@/components/booking/RescheduleBookingModal";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikFilterTabs,
  KlinikSecondaryButton,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { Booking, BookingStatus } from "@/types/booking";
import { useClinicBookings } from "@/hooks/use-clinic-bookings";
import { formatCurrency } from "@/lib/booking/format";
import { notifyError } from "@/lib/ui/notify";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import {
  fetchClinicBookingsPage,
} from "@/lib/booking/fetch-clinic-bookings-page";

type FilterTab = "Semua" | BookingStatus;

export default function BookingPage() {
  const { profile } = useClinicSession();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null
  );
  const [exporting, setExporting] = useState(false);

  const {
    bookings,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    error,
    stats,
    statsLoading,
    loadMore,
    updateStatus,
    reschedule,
    isSearchMode,
  } = useClinicBookings({
    statusFilter: activeFilter,
    dateFilter: selectedDate,
    search: searchQuery,
  });

  const filterTabs: FilterTab[] = ["Semua", "Terjadwal", "Selesai", "Dibatalkan"];

  const listDescription = useMemo(() => {
    if (loading) return "Memuat daftar booking...";
    if (isSearchMode) {
      return `${bookings.length} hasil pencarian`;
    }
    if (bookings.length < totalCount) {
      return `${bookings.length} dari ${totalCount} booking ditampilkan`;
    }
    return `${bookings.length} booking ditampilkan`;
  }, [loading, isSearchMode, bookings.length, totalCount]);

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateStatus(id, status);
      setSelectedBooking((prev) =>
        prev && prev.id === id ? { ...prev, status } : prev
      );
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
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menjadwalkan ulang");
    }
  };

  const handleEkspor = async () => {
    if (!profile) return;
    setExporting(true);
    try {
      const supabase = createClient();
      const { bookings: allRows } = await fetchClinicBookingsPage(
        supabase,
        profile.id,
        {
          from: 0,
          to: 0,
          statusFilter: activeFilter,
          dateFilter: selectedDate || undefined,
          searchLimit: 5000,
        }
      );

      const exportRows = searchQuery.trim()
        ? allRows.filter((b) => {
            const q = searchQuery.trim().toLowerCase();
            return [
              b.namaPasien,
              b.namaPemilik,
              b.namaDokter ?? "",
              ...(b.namaLayanan ?? []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(q);
          })
        : allRows;

      const headers = [
        "ID",
        "Pasien",
        "Jenis Hewan",
        "Ras",
        "Pemilik",
        "Dokter",
        "Layanan",
        "Channel",
        "Tanggal",
        "Jam Mulai",
        "Jam Selesai",
        "Total",
        "Status Booking",
        "Status Pembayaran",
      ];
      const rows = exportRows.map((b) =>
        [
          b.id,
          b.namaPasien,
          b.kategori,
          b.jenis,
          b.namaPemilik,
          b.namaDokter ?? "",
          (b.namaLayanan ?? []).join("; "),
          b.channel ?? "clinic",
          b.tanggal,
          b.jamMulai,
          b.jamSelesai,
          b.totalAmount ?? 0,
          b.displayLabel ?? b.status,
          b.paymentStatus ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data-booking.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    {
      label: "Hari ini",
      value: stats.todayCount,
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      label: "Akan datang",
      value: stats.upcoming,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Selesai",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      label: "Pendapatan lunas",
      value: formatCurrency(stats.revenue),
      icon: Banknote,
      color: "text-emerald-600",
      isText: true,
    },
  ];

  return (
    <KlinikPageLayout
      title="Booking"
      description="Kelola jadwal janji temu klinik"
      actions={
        <KlinikSecondaryButton
          icon={<Download size={16} />}
          onClick={() => void handleEkspor()}
          disabled={exporting}
        >
          {exporting ? "Mengekspor..." : "Ekspor"}
        </KlinikSecondaryButton>
      }
    >
      {error ? <KlinikPageAlert message={error} /> : null}

      {statsLoading && !loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse"
            >
              <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className={`flex items-center gap-2 ${stat.color} mb-2`}>
                <stat.icon size={16} />
                <span className="text-xs font-medium text-gray-500">
                  {stat.label}
                </span>
              </div>
              <p
                className={`font-bold text-gray-900 ${
                  stat.isText ? "text-lg" : "text-2xl"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <KlinikFilterTabs
        tabs={filterTabs}
        active={activeFilter}
        onChange={setActiveFilter}
        trailing={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 min-w-[200px]">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                role="searchbox"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pasien, pemilik, dokter..."
                className="text-sm text-gray-700 outline-none bg-transparent w-full min-w-0"
                autoComplete="off"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  aria-label="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
              <CalendarDays size={14} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm text-gray-700 outline-none bg-transparent"
              />
              {selectedDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        }
      />

      <KlinikSectionCard
        title="Daftar Booking"
        description={listDescription}
      >
        <div className="px-5 pb-5 pt-5">
          <BookingList
            bookings={bookings}
            onSelectBooking={setSelectedBooking}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore && !isSearchMode}
            onLoadMore={loadMore}
            searchQuery={searchQuery}
          />
        </div>
      </KlinikSectionCard>

      {selectedBooking && (
        <DetailBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
          onReschedule={(id) => {
            const b = bookings.find((x) => x.id === id);
            if (b) {
              setSelectedBooking(null);
              setRescheduleBooking(b);
            }
          }}
          onCancel={(id) => handleUpdateStatus(id, "Dibatalkan")}
        />
      )}

      {rescheduleBooking && (
        <RescheduleBookingModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSubmit={handleSubmitReschedule}
        />
      )}
    </KlinikPageLayout>
  );
}
