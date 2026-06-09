"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import BookingList from "@/components/booking/BookingList";
import TambahBookingModal from "@/components/booking/TambahBookingModal";
import DetailBookingModal from "@/components/booking/DetailBookingModal";
import RescheduleBookingModal from "@/components/booking/RescheduleBookingModal";
import { Booking, BookingStatus } from "@/types/booking";
import { useClinicBookings } from "@/hooks/use-clinic-bookings";
import { dbStatusFromUiFilter } from "@/lib/booking/display-status";

type FilterTab = "Semua" | BookingStatus;

export default function BookingPage() {
  const {
    bookings,
    loading,
    error,
    updateStatus,
    reschedule,
    createManual,
  } = useClinicBookings();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null
  );

  const filterTabs: FilterTab[] = ["Semua", "Terjadwal", "Selesai", "Dibatalkan"];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus =
        activeFilter === "Semua" ||
        b.status === activeFilter ||
        (activeFilter === "Terjadwal" &&
          b.rawStatus &&
          dbStatusFromUiFilter("Terjadwal").includes(b.rawStatus));
      const matchDate = !selectedDate || b.tanggal === selectedDate;
      return matchStatus && matchDate;
    });
  }, [bookings, activeFilter, selectedDate]);

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateStatus(id, status);
      setSelectedBooking((prev) =>
        prev && prev.id === id ? { ...prev, status } : prev
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status");
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
      alert(e instanceof Error ? e.message : "Gagal menjadwalkan ulang");
    }
  };

  const handleEkspor = () => {
    const headers = [
      "Nama Pasien",
      "Nama Pemilik",
      "Kategori",
      "Jenis",
      "Usia",
      "Jam Mulai",
      "Jam Selesai",
      "Tanggal",
      "Status",
    ];
    const rows = bookings.map((b) =>
      [
        b.namaPasien,
        b.namaPemilik,
        b.kategori,
        b.jenis,
        b.usia,
        b.jamMulai,
        b.jamSelesai,
        b.tanggal,
        b.displayLabel ?? b.status,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-booking.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Booking</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola jadwal dan tambahkan janji temu
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEkspor}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Ekspor File
          </button>
          <button
            type="button"
            onClick={() => setIsTambahOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            + Tambah Booking
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      {loading && (
        <p className="text-sm text-gray-500 mb-4">Memuat booking...</p>
      )}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === tab
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto bg-white border border-gray-200 rounded-lg px-3 py-1.5">
          <span className="text-gray-400 text-sm">📅</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm text-gray-700 outline-none bg-transparent"
          />
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="text-xs text-gray-400 hover:text-gray-600 ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <BookingList
        bookings={filteredBookings}
        onSelectBooking={setSelectedBooking}
      />

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

      {isTambahOpen && (
        <TambahBookingModal
          onClose={() => setIsTambahOpen(false)}
          onSubmit={async (payload) => {
            try {
              await createManual(payload);
              setIsTambahOpen(false);
            } catch (e) {
              alert(e instanceof Error ? e.message : "Gagal menambah booking");
            }
          }}
        />
      )}
    </div>
  );
}
