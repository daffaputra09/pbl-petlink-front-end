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
import {
  deactivateDoctor,
  deleteInactiveDoctor,
  getDoctorDeactivationStatus,
  inviteDoctor,
  resendDoctorInvite,
  updateDoctorProfile,
} from "@/lib/actions/invite-doctor";
import { confirmAction } from "@/lib/ui/confirm-store";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

function matchesDoctorSearch(doctor: Doctor, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [
    doctor.nama,
    doctor.email,
    doctor.spesialisasi,
    doctor.licenseNumber ?? "",
    doctor.status,
    doctor.awaitingPasswordSetup ? "menunggu kata sandi" : "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export default function DokterPage() {
  const { doctors, loading, error, refresh } = useClinicDoctors();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    const aktif = doctors.filter((d) => d.isActive).length;
    return {
      total: doctors.length,
      aktif,
      nonaktif: doctors.length - aktif,
    };
  }, [doctors]);

  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) => matchesDoctorSearch(doctor, searchQuery)),
    [doctors, searchQuery]
  );

  function handleAdd() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(doctor: Doctor) {
    setEditData(doctor);
    setModalOpen(true);
  }

  async function handleSave(input: DoctorFormInput) {
    if (editData && editData.isActive && !input.isActive) {
      const status = await getDoctorDeactivationStatus(editData.id);
      if (!status.canDeactivate) {
        notifyError(status.message ?? "Dokter tidak dapat dinonaktifkan.");
        return;
      }

      const ok = await confirmAction({
        title: `Nonaktifkan ${status.doctorName}?`,
        message:
          "Dokter tidak akan muncul untuk booking atau konsultasi baru. Anda dapat mengaktifkan kembali dari menu edit.",
        confirmLabel: "Nonaktifkan",
        destructive: true,
      });
      if (!ok) return;
    }

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
        notifySuccess("Profil dokter diperbarui.");
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

  async function handleDeactivate(doctor: Doctor) {
    try {
      const status = await getDoctorDeactivationStatus(doctor.id);
      if (!status.canDeactivate) {
        notifyError(status.message ?? "Dokter tidak dapat dinonaktifkan.");
        return;
      }

      const ok = await confirmAction({
        title: `Nonaktifkan ${status.doctorName}?`,
        message:
          "Dokter tidak akan muncul untuk booking atau konsultasi baru. Tindakan ini dapat dibatalkan dengan mengaktifkan kembali dari menu edit. Pastikan tidak ada booking atau konsultasi yang masih berjalan.",
        confirmLabel: "Nonaktifkan",
        destructive: true,
      });
      if (!ok) return;

      await deactivateDoctor(doctor.id);
      await refresh();
      notifySuccess("Dokter berhasil dinonaktifkan.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menonaktifkan dokter");
    }
  }

  async function handlePermanentDelete(doctor: Doctor) {
    const ok = await confirmAction({
      title: `Hapus ${doctor.nama} permanen?`,
      message:
        "Akun dokter akan dihapus dari sistem dan email dapat digunakan untuk pendaftaran ulang. Riwayat booking/konsultasi yang sudah selesai tetap tersimpan. Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Hapus permanen",
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteInactiveDoctor(doctor.id);
      await refresh();
      notifySuccess("Dokter berhasil dihapus. Email dapat digunakan kembali.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menghapus dokter");
    }
  }

  async function handleResendInvite(id: string) {
    try {
      await resendDoctorInvite(id);
      notifySuccess("Email undangan dikirim ulang.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal mengirim ulang undangan");
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
            description={
              searchQuery.trim()
                ? `${filteredDoctors.length} dari ${stats.total} dokter`
                : `${stats.total} dokter terdaftar`
            }
          >
            <DoctorTable
              doctors={filteredDoctors}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
              onPermanentDelete={handlePermanentDelete}
              onResendInvite={handleResendInvite}
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
