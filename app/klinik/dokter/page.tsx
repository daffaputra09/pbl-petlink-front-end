"use client";

import { useState } from "react";
import DoctorStatCards from "@/components/dokter/DoctorStatCard";
import DoctorTable from "@/components/dokter/DoctorTable";
import AddDoctorModal from "@/components/dokter/AddDoctorModal";
import DoctorScheduleTable from "@/components/dokter/DoctorScheduleTable";
import { Doctor } from "@/types/dokter";
import { DUMMY_DOCTORS } from "@/data/dokter";
import { JadwalDokter } from "@/types/jadwal";
import { DUMMY_JADWAL } from "@/data/jadwal";

export default function DokterPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(DUMMY_DOCTORS);
  const [jadwal] = useState<JadwalDokter[]>(DUMMY_JADWAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Doctor | null>(null);

  // Stat counts
  const totalDokter = doctors.length;
  const bertugas = doctors.filter((d) => d.status === "Bertugas").length;
  const cuti = doctors.filter((d) => d.status === "Cuti").length;
  const operasi = doctors.filter((d) => d.status === "Operasi").length;

  function handleAdd() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(doctor: Doctor) {
    setEditData(doctor);
    setModalOpen(true);
  }

  function handleSave(doctor: Doctor) {
    setDoctors((prev) => {
      const exists = prev.find((d) => d.id === doctor.id);
      if (exists) {
        return prev.map((d) => (d.id === doctor.id ? doctor : d));
      }
      return [...prev, doctor];
    });
  }

  function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus dokter ini?")) {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  }

  return (
    <>
      {/* Stat Cards */}
      <DoctorStatCards
        total={totalDokter}
        bertugas={bertugas}
        cuti={cuti}
        operasi={operasi}
      />

      {/* Tabel e dokter yes */}
      <DoctorTable
        doctors={doctors}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onAdd={handleAdd}
      />

      {/* Tabel ringkasan jadwal dokter */}
      <DoctorScheduleTable doctors={doctors} jadwal={jadwal} />

      {/* tambah dokter modal */}
      <AddDoctorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
      />
    </>
  );
}