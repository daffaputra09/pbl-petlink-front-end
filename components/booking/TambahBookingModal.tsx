"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Booking, BookingStatus } from "@/app/klinik/booking/page";

type Props = {
  onClose: () => void;
  onSubmit: (booking: Omit<Booking, "id">) => void;
};

export default function TambahBookingModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    namaPasien: "",
    namaPemilik: "",
    jenis: "",
    usia: "",
    jamMulai: "",
    jamSelesai: "",
    tanggal: "",
    status: "Terjadwal" as BookingStatus,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaPasien || !form.namaPemilik || !form.tanggal || !form.jamMulai || !form.jamSelesai) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Tambah Booking</h2>
            <p className="text-xs text-gray-400 mt-0.5">Isi detail janji temu baru</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Nama Pasien (Hewan)
              </label>
              <input
                name="namaPasien"
                value={form.namaPasien}
                onChange={handleChange}
                required
                placeholder="Contoh: Chiko"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Nama Pemilik
              </label>
              <input
                name="namaPemilik"
                value={form.namaPemilik}
                onChange={handleChange}
                required
                placeholder=""
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Jenis</label>
              <input
                name="jenis"
                value={form.jenis}
                onChange={handleChange}
                placeholder="Contoh: Anggora"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Usia</label>
              <input
                name="usia"
                value={form.usia}
                onChange={handleChange}
                placeholder="Contoh: 2 Tahun"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Jam Mulai</label>
              <input
                type="time"
                name="jamMulai"
                value={form.jamMulai}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Jam Selesai</label>
              <input
                type="time"
                name="jamSelesai"
                value={form.jamSelesai}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tanggal</label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition bg-white"
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Simpan Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
