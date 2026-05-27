"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import DoctorStatCards from "@/components/dokter/DoctorStatCard";
import DoctorTable from "@/components/dokter/DoctorTable";
import AddDoctorModal from "@/components/dokter/AddDoctorModal";

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

// ─── DATA DUMMY ───────────────────────────────────────────────────────────────
const DUMMY_DOCTORS: Doctor[] = [
  {
    id: "VET-2024-001",
    nama: "Drh. Anisa Putri",
    email: "anisa.putri@vetcare.pro",
    phone: "+62 902-1143",
    spesialisasi: ["Bedah", "Orthopedics"],
    status: "Bertugas",
    jadwal: ["Mon", "Tue", "Thu", "Fri"],
    biografi:
      "Dokter hewan berpengalaman dengan keahlian di bidang bedah orthopedic.",
  },
  {
    id: "VET-2024-008",
    nama: "Drh. Burhan Dwi",
    email: "b.dwi@vetcare.pro",
    phone: "+62 231-8890",
    spesialisasi: ["Dermatology"],
    status: "Cuti",
    jadwal: ["Mon", "Wed", "Fri"],
    biografi: "Spesialis kulit hewan dengan pengalaman lebih dari 8 tahun.",
  },
  {
    id: "VET-2024-012",
    nama: "Drh. Dina Safira",
    email: "dinasaa@vetcare.pro",
    phone: "+62 443-1209",
    spesialisasi: ["General Praktek"],
    status: "Bertugas",
    jadwal: ["Tue", "Thu", "Sat"],
    biografi:
      "Dokter umum yang ramah dan berdedikasi tinggi terhadap perawatan hewan peliharaan.",
  },
  {
    id: "VET-2024-015",
    nama: "Drh. Rizky Fauzan",
    email: "rizky.f@vetcare.pro",
    phone: "+62 812-3344",
    spesialisasi: ["Kardiologi"],
    status: "Bertugas",
    jadwal: ["Mon", "Thu"],
    biografi: "Spesialis jantung hewan dengan riset aktif di bidang kardiologi.",
  },
  {
    id: "VET-2024-019",
    nama: "Drh. Sari Indah",
    email: "sari.indah@vetcare.pro",
    phone: "+62 878-9900",
    spesialisasi: ["Neurologi"],
    status: "Operasi",
    jadwal: ["Tue", "Wed", "Fri"],
    biografi: "Ahli saraf hewan dengan keahlian diagnosis gangguan neurologis.",
  },
  {
    id: "VET-2024-022",
    nama: "Drh. Hendra Kusuma",
    email: "hendra.k@vetcare.pro",
    phone: "+62 856-7721",
    spesialisasi: ["Bedah"],
    status: "Bertugas",
    jadwal: ["Mon", "Tue", "Wed"],
    biografi: "Spesialis bedah umum dengan lebih dari 500 operasi berhasil.",
  },
  {
    id: "VET-2024-025",
    nama: "Drh. Maya Lestari",
    email: "maya.l@vetcare.pro",
    phone: "+62 821-5566",
    spesialisasi: ["Oftalmologi"],
    status: "Bertugas",
    jadwal: ["Thu", "Fri", "Sat"],
    biografi: "Dokter mata hewan yang berspesialisasi dalam operasi katarak.",
  },
  {
    id: "VET-2024-030",
    nama: "Drh. Fajar Nugroho",
    email: "fajar.n@vetcare.pro",
    phone: "+62 895-4422",
    spesialisasi: ["Onkologi"],
    status: "Cuti",
    jadwal: ["Mon", "Wed"],
    biografi: "Ahli onkologi hewan dengan pendekatan holistik dalam terapi kanker.",
  },
];
// ──────────────────────────────────────────────────────────────────────────────

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