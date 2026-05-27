"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

type DoctorStatus = "Bertugas" | "Cuti" | "Operasi";

interface Doctor {
  id: string;
  nama: string;
  email: string;
  phone: string;
  spesialisasi: string[];
  status: DoctorStatus;
  photo?: string;
  jadwal: string[];
  biografi?: string;
}

interface DoctorTableProps {
  doctors: Doctor[];
  onDelete: (id: string) => void;
  onEdit: (doctor: Doctor) => void;
  onAdd: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Bertugas: "bg-teal-50 text-teal-700 border border-teal-200",
  Cuti: "bg-gray-100 text-gray-600 border border-gray-200",
  Operasi: "bg-red-50 text-red-600 border border-red-200",
};

const SPESIALISASI_COLORS: Record<string, string> = {
  Bedah: "bg-teal-600 text-white",
  Orthopedics: "bg-orange-400 text-white",
  Dermatology: "bg-yellow-500 text-white",
  "General Praktek": "bg-teal-500 text-white",
  Neurologi: "bg-purple-500 text-white",
  Kardiologi: "bg-red-500 text-white",
  Oftalmologi: "bg-blue-500 text-white",
  Onkologi: "bg-pink-500 text-white",
};

const PAGE_SIZE = 3;

export default function DoctorTable({
  doctors,
  onDelete,
  onEdit,
  onAdd,
}: DoctorTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(doctors.length / PAGE_SIZE);
  const paginated = doctors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
    <div>
      <h2 className="text-xl font-bold text-gray-800">
        Manajemen Dokter
      </h2>

      <p className="text-sm text-gray-500 mt-0.5">
        Mengelola, ketersediaan, dan spesialisasi klinis
      </p>
    </div>

    {/* Button */}
    <button
      onClick={onAdd}
      className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      <Plus size={18} />
      Tambah Dokter
    </button>
  </div>

      {/* Table */}
      <div className="overflow-x-auto px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nama Dokter
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Spesialisasi
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Informasi Kontak
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  Belum ada dokter terdaftar.
                </td>
              </tr>
            ) : (
              paginated.map((doctor) => (
                <tr
                  key={doctor.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Nama */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {doctor.photo ? (
                          <img
                            src={doctor.photo}
                            alt={doctor.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                            {doctor.nama.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {doctor.nama}
                        </p>
                        <p className="text-xs text-gray-400">{doctor.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Spesialisasi */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.spesialisasi.map((s) => (
                        <span
                          key={s}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            SPESIALISASI_COLORS[s] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Kontak */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{doctor.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doctor.phone}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        STATUS_STYLES[doctor.status] ?? ""
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(doctor)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(doctor.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Menampilkan{" "}
          <span className="font-medium">
            {doctors.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, doctors.length)}
          </span>{" "}
          dari <span className="font-medium">{doctors.length}</span> dokter
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-teal-700 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}