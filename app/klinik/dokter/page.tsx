"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import DoctorStatCards from "@/components/dokter/DoctorStatCard";
import DoctorTable from "@/components/dokter/DoctorTable";
import AddDoctorModal from "@/components/dokter/AddDoctorModal";
import { Doctor } from "@/types/dokter";
import { DUMMY_DOCTORS } from "@/data/dokter";

export default function DokterPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(DUMMY_DOCTORS);
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