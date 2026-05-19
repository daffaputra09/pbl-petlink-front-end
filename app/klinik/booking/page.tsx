"use client";

import { useState } from "react";
import BookingList from "@/components/booking/BookingList";
import TambahBookingModal from "@/components/booking/TambahBookingModal";
import { Download } from "lucide-react";

export type BookingStatus = "Terjadwal" | "Selesai" | "Dibatalkan";

export type Booking = {
  id: string;
  namaPasien: string;
  jenis: string;
  usia: string;
  jamMulai: string;
  jamSelesai: string;
  tanggal: string;
  status: BookingStatus;
};

const DUMMY_BOOKINGS: Booking[] = [
  { id: "1", namaPasien: "Chiko",    jenis: "Anggora",        usia: "2 Tahun", jamMulai: "08:00", jamSelesai: "10:00", tanggal: "2026-04-24", status: "Terjadwal" },
  { id: "2", namaPasien: "Rocky",    jenis: "Golden Retriever",usia: "4 Tahun", jamMulai: "11:00", jamSelesai: "12:00", tanggal: "2026-04-24", status: "Terjadwal" },
  { id: "3", namaPasien: "Luna",     jenis: "Fuzzy Lop",      usia: "1 Tahun", jamMulai: "16:00", jamSelesai: "18:00", tanggal: "2026-04-24", status: "Terjadwal" },
  { id: "4", namaPasien: "Mango",    jenis: "Bulldog",        usia: "2 Tahun", jamMulai: "19:00", jamSelesai: "20:00", tanggal: "2026-04-24", status: "Terjadwal" },
  { id: "5", namaPasien: "Alamanda", jenis: "Persia",         usia: "1 Tahun", jamMulai: "09:00", jamSelesai: "10:00", tanggal: "2026-04-25", status: "Terjadwal" },
  { id: "6", namaPasien: "Sica",     jenis: "Hamster",        usia: "1 Tahun", jamMulai: "12:00", jamSelesai: "14:00", tanggal: "2026-04-25", status: "Terjadwal" },
];

type FilterTab = "Semua" | BookingStatus;

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>(DUMMY_BOOKINGS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [selectedDate, setSelectedDate] = useState<string>("2026-03-10");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterTabs: FilterTab[] = ["Semua", "Terjadwal", "Selesai", "Dibatalkan"];

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = activeFilter === "Semua" || b.status === activeFilter;
    return matchStatus;
  });

  const handleTambahBooking = (newBooking: Omit<Booking, "id">) => {
    const booking: Booking = {
      ...newBooking,
      id: Date.now().toString(),
    };
    setBookings((prev) => [...prev, booking]);
    setIsModalOpen(false);
  };

  const handleEkspor = () => {
    const headers = ["Nama Pasien", "jenis", "Usia", "Jam Mulai", "Jam Selesai", "Tanggal", "Status"];
    const rows = bookings.map((b) =>
      [b.namaPasien, b.jenis, b.usia, b.jamMulai, b.jamSelesai, b.tanggal, b.status].join(",")
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
          <p className="text-sm text-gray-500 mt-0.5">Kelola jadwal dan tambahkan janji temu</p>
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
            onClick={() => setIsModalOpen(true)}
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
          <button className="text-sm text-gray-500 hover:text-gray-700 ml-1">Ubah</button>
        </div>
      </div>

      {/* Booking List */}
      <BookingList bookings={filteredBookings} />

      {/* Modal */}
      {isModalOpen && (
        <TambahBookingModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTambahBooking}
        />
      )}
    </div>
  );
}
