"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Doctor } from "@/types/dokter";
import { JadwalDokter } from "@/types/jadwal";

interface DoctorScheduleRowProps {
  doctor: Doctor;
  jadwal: JadwalDokter[];
}

export default function DoctorScheduleRow({
  doctor,
  jadwal,
}: DoctorScheduleRowProps) {
  const router = useRouter();
  const doctorJadwal = jadwal.filter((j) => j.doctorId === doctor.id);
  const aktif = doctorJadwal.filter((j) => j.status === "Aktif").length;
  const hariList = Array.from(new Set(doctorJadwal.map((j) => j.hari)));

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Nama */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {doctor.photo ? (
              <img
                src={doctor.photo}
                alt={doctor.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                {doctor.nama.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{doctor.nama}</p>
            <p className="text-xs text-gray-400">{doctor.id}</p>
          </div>
        </div>
      </td>

      {/* Hari Praktik */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {hariList.length === 0 ? (
            <span className="text-xs text-gray-400">Belum ada jadwal</span>
          ) : (
            hariList.map((h) => (
              <span
                key={h}
                className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 font-medium"
              >
                {h}
              </span>
            ))
          )}
        </div>
      </td>

      {/* Total Jadwal */}
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-700">
          {doctorJadwal.length}
        </span>
        <span className="text-xs text-gray-400 ml-1">sesi</span>
      </td>

      {/* Aktif */}
      <td className="px-6 py-4">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            aktif > 0
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-400 border border-gray-200"
          }`}
        >
          {aktif} aktif
        </span>
      </td>

      {/* Aksi */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={() =>
            router.push(`/klinik/dokter/jadwal?doctorId=${doctor.id}`)
          }
          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
        >
          <CalendarDays size={13} />
          Lihat Jadwal
        </button>
      </td>
    </tr>
  );
}
