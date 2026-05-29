"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import BookingList from "@/components/booking/BookingList";
import TambahBookingModal from "@/components/booking/TambahBookingModal";
import DetailBookingModal from "@/components/booking/DetailBookingModal";
import { Booking, BookingStatus } from "@/types/booking";
import { DUMMY_BOOKINGS } from "@/data/booking";

type FilterTab = "Semua" | BookingStatus;

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>(DUMMY_BOOKINGS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filterTabs: FilterTab[] = ["Semua", "Terjadwal", "Selesai", "Dibatalkan"];

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = activeFilter === "Semua" || b.status === activeFilter;
    const matchDate = !selectedDate || b.tanggal === selectedDate;
    return matchStatus && matchDate;
  });

  const handleTambahBooking = (newBooking: Omit<Booking, "id">) => {
    const booking: Booking = { ...newBooking, id: Date.now().toString() };
    setBookings((prev) => [...prev, booking]);
    setIsTambahOpen(false);
  };

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );

    setSelectedBooking((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev
    );
  };

  const handleReschedule = (id: string) => {
    // TODO: open reschedule form — close detail for now
    setSelectedBooking(null);
    alert(`Reschedule booking #${id} — tambahkan form reschedule di sini.`);
  };

  const handleCancel = (id: string) => {
    handleUpdateStatus(id, "Dibatalkan");
    setSelectedBooking(null);
  };

  const handleEkspor = () => {
    const headers = [
      "Nama Pasien", "Nama Pemilik", "Kategori", "Jenis", "Usia",
      "Berat (kg)", "Jenis Kelamin", "Jam Mulai", "Jam Selesai", "Tanggal", "Status",
    ];
    const rows = bookings.map((b) =>
      [
        b.namaPasien, b.namaPemilik, b.kategori, b.jenis, b.usia,
        b.beratKg, b.jenisKelamin, b.jamMulai, b.jamSelesai, b.tanggal, b.status,
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Booking</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola jadwal dan tambahkan janji temu
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleEkspor}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Ekspor File
          </button>
          <button
            onClick={() => setIsTambahOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            + Tambah Booking
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab}
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

        {/* Date Picker */}
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
              onClick={() => setSelectedDate("")}
              className="text-xs text-gray-400 hover:text-gray-600 ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Booking List */}
      <BookingList
        bookings={filteredBookings}
        onSelectBooking={setSelectedBooking}
      />

      {/* Detail Modal */}
      {selectedBooking && (
        <DetailBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      )}

      {/* Tambah Booking Modal */}
      {isTambahOpen && (
        <TambahBookingModal
          onClose={() => setIsTambahOpen(false)}
          onSubmit={handleTambahBooking}
        />
      )}
    </div>
  );
}
