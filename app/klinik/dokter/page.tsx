"use client";

import { useState } from "react";
import DoctorStatCards from "@/components/dokter/DoctorStatCard";
import DoctorTable from "@/components/dokter/DoctorTable";
import AddDoctorModal from "@/components/dokter/AddDoctorModal";
import DoctorScheduleTable from "@/components/dokter/DoctorScheduleTable";
import { Doctor } from "@/types/dokter";
import { useClinicDoctors } from "@/hooks/use-clinic-doctors";
import { inviteDoctor, updateDoctorProfile } from "@/lib/actions/invite-doctor";

export default function DokterPage() {
  const { doctors, loading, refresh } = useClinicDoctors();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Doctor | null>(null);

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

  async function handleSave(doctor: Doctor, password?: string) {
    try {
      if (editData) {
        await updateDoctorProfile({
          doctorId: doctor.id,
          name: doctor.nama,
          specialization: doctor.spesialisasi[0],
          bio: doctor.biografi,
          isActive: doctor.status !== "Cuti",
        });
      } else {
        if (!password) {
          alert("Kata sandi wajib untuk dokter baru.");
          return;
        }
        await inviteDoctor({
          email: doctor.email,
          password,
          name: doctor.nama,
          specialization: doctor.spesialisasi[0] ?? "General Praktek",
          bio: doctor.biografi,
          isActive: doctor.status !== "Cuti",
        });
      }
      setModalOpen(false);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan dokter");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Nonaktifkan dokter ini?")) return;
    try {
      await updateDoctorProfile({
        doctorId: id,
        isActive: false,
      });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menonaktifkan");
    }
  }

  return (
    <>
      <DoctorStatCards
        total={totalDokter}
        bertugas={bertugas}
        cuti={cuti}
        operasi={operasi}
      />

      {loading ? (
        <p className="px-6 text-sm text-gray-500">Memuat dokter...</p>
      ) : (
        <DoctorTable
          doctors={doctors}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DoctorScheduleTable doctors={doctors} jadwal={[]} />

      <AddDoctorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
      />
    </>
  );
}
