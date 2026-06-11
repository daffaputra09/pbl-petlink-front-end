"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Mail,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserX,
  Search,
} from "lucide-react";
import type { Doctor } from "@/types/dokter";

interface DoctorTableProps {
  doctors: Doctor[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onDeactivate: (doctor: Doctor) => void;
  onPermanentDelete: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onResendInvite?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Aktif: "bg-teal-50 text-teal-700 border border-teal-200",
  Nonaktif: "bg-gray-100 text-gray-600 border border-gray-200",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const PAGE_SIZE = 5;

export default function DoctorTable({
  doctors,
  searchQuery,
  onSearchQueryChange,
  onDeactivate,
  onPermanentDelete,
  onEdit,
  onResendInvite,
}: DoctorTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(doctors.length / PAGE_SIZE));
  const paginated = doctors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, doctors.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <>
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Cari nama, email, spesialisasi, atau STR..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dokter
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Spesialisasi
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tarif Konsultasi
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Kontak
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
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  {searchQuery.trim()
                    ? "Tidak ada dokter yang cocok dengan pencarian."
                    : "Belum ada dokter terdaftar."}
                </td>
              </tr>
            ) : (
              paginated.map((doctor) => (
                <tr
                  key={doctor.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {doctor.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                        {doctor.licenseNumber ? (
                          <p className="text-xs text-gray-400">
                            STR: {doctor.licenseNumber}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-100">
                      {doctor.spesialisasi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatRupiah(doctor.consultationFee)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{doctor.email || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`text-xs font-medium px-3 py-1.5 rounded-full w-fit ${
                          STATUS_STYLES[doctor.status] ?? ""
                        }`}
                      >
                        {doctor.status}
                      </span>
                      {doctor.awaitingPasswordSetup ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full w-fit bg-amber-50 text-amber-700 border border-amber-200">
                          Menunggu kata sandi
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/klinik/dokter/jadwal?doctorId=${doctor.id}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1E6B4F] hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                        title="Kelola jadwal"
                      >
                        <CalendarDays size={14} />
                        Jadwal
                      </button>
                      {doctor.awaitingPasswordSetup && onResendInvite ? (
                        <button
                          type="button"
                          onClick={() => onResendInvite(doctor.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
                          title="Kirim ulang email undangan"
                        >
                          <Mail size={14} />
                          Undang ulang
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onEdit(doctor)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      {doctor.isActive ? (
                        <button
                          type="button"
                          onClick={() => onDeactivate(doctor)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Nonaktifkan"
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPermanentDelete(doctor)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus permanen"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/60">
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
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-teal-700 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
