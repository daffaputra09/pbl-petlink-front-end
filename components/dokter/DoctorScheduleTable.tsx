"use client";

import { Doctor } from "@/types/dokter";
import { JadwalDokter } from "@/types/jadwal";
import DoctorScheduleRow from "./DoctorScheduleRow";

interface DoctorScheduleTableProps {
  doctors: Doctor[];
  jadwal: JadwalDokter[];
}

export default function DoctorScheduleTable({
  doctors,
  jadwal,
}: DoctorScheduleTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Jadwal Dokter</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Ringkasan jadwal praktik per dokter
        </p>
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
                Hari Praktik
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Sesi
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Detail
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  Belum ada data dokter.
                </td>
              </tr>
            ) : (
              doctors.map((doctor) => (
                <DoctorScheduleRow
                  key={doctor.id}
                  doctor={doctor}
                  jadwal={jadwal}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
