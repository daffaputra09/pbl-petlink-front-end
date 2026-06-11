"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import DoctorStatCards from "@/components/dokter/DoctorStatCard";
import DoctorTable from "@/components/dokter/DoctorTable";
import AddDoctorModal from "@/components/dokter/AddDoctorModal";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikPageLoading,
  KlinikPrimaryButton,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import type { Doctor, DoctorFormInput } from "@/types/dokter";
import { useClinicDoctors } from "@/hooks/use-clinic-doctors";
import { inviteDoctor, updateDoctorProfile } from "@/lib/actions/invite-doctor";
import { confirmAction } from "@/lib/ui/confirm-store";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export default function DokterPage() {
  const { doctors, loading, error, refresh } = useClinicDoctors();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const aktif = doctors.filter((d) => d.isActive).length;
    return {
      total: doctors.length,
      aktif,
      nonaktif: doctors.length - aktif,
    };
  }, [doctors]);

  function handleAdd() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(doctor: Doctor) {
    setEditData(doctor);
    setModalOpen(true);
  }

  async function handleSave(input: DoctorFormInput) {
    setSaving(true);
    try {
      if (editData) {
        await updateDoctorProfile({
          doctorId: editData.id,
          name: input.nama,
          specialization: input.spesialisasi,
          bio: input.bio,
          licenseNumber: input.licenseNumber,
          consultationFee: input.consultationFee,
          isActive: input.isActive,
          photoFile: input.photoFile,
        });
      } else {
        await inviteDoctor({
          email: input.email,
          name: input.nama,
          specialization: input.spesialisasi,
          bio: input.bio,
          licenseNumber: input.licenseNumber,
          consultationFee: input.consultationFee,
          isActive: input.isActive,
          photoFile: input.photoFile,
        });
        notifySuccess(
          "Dokter ditambahkan. Email undangan untuk atur kata sandi telah dikirim."
        );
      }
      setModalOpen(false);
      await refresh();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menyimpan dokter");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Nonaktifkan dokter?",
      message: "Dokter tidak akan muncul untuk booking (is_active = false).",
      confirmLabel: "Nonaktifkan",
      destructive: true,
    });
    if (!ok) return;
    try {
      await updateDoctorProfile({
        doctorId: id,
        isActive: false,
      });
      await refresh();
      notifySuccess("Dokter dinonaktifkan.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menonaktifkan");
    }
  }

  return (
    <KlinikPageLayout
      title="Dokter"
      description="Kelola profil dokter dan jadwal praktik klinik"
      actions={
        <KlinikPrimaryButton icon={<Plus size={16} />} onClick={handleAdd}>
          Tambah Dokter
        </KlinikPrimaryButton>
      }
    >
      {error ? <KlinikPageAlert message={error} /> : null}

      {loading ? (
        <KlinikPageLoading message="Memuat dokter..." />
      ) : (
        <>
          <DoctorStatCards
            total={stats.total}
            aktif={stats.aktif}
            nonaktif={stats.nonaktif}
          />

          <KlinikSectionCard
            title="Daftar Dokter"
            description={`${stats.total} dokter terdaftar`}
          >
            <DoctorTable
              doctors={doctors}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </KlinikSectionCard>
        </>
      )}

      <AddDoctorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editData={editData}
        saving={saving}
      />
    </KlinikPageLayout>
  );
}
