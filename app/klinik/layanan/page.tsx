"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import ServiceStatCard from "@/components/layanan/ServiceStatCard";
import { ServiceGrid } from "@/components/layanan/ServiceCard";
import ServiceFormModal from "@/components/layanan/ServiceFormModal";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikPageLoading,
  KlinikFilterTabs,
  KlinikPrimaryButton,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicServices } from "@/hooks/use-clinic-services";
import {
  buildServiceStats,
  matchesServiceSearch,
  sortServicesForDisplay,
} from "@/lib/layanan/presentation";
import { confirmAction } from "@/lib/ui/confirm-store";
import { notifyError, notifySuccess } from "@/lib/ui/notify";
import type { ClinicService, ServiceFormInput } from "@/types/layanan";

type FilterTab = "Semua" | "Aktif" | "Nonaktif";

export default function LayananPage() {
  const { services, loading, error, upsert, setActive } = useClinicServices();
  const [filter, setFilter] = useState<FilterTab>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ClinicService | null>(null);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => buildServiceStats(services), [services]);

  const filtered = useMemo(() => {
    let list = services;

    if (filter === "Aktif") list = list.filter((s) => s.isActive);
    else if (filter === "Nonaktif") list = list.filter((s) => !s.isActive);

    if (searchQuery.trim()) {
      list = list.filter((s) => matchesServiceSearch(s, searchQuery));
    }

    return sortServicesForDisplay(list, filter);
  }, [services, filter, searchQuery]);

  const listDescription = useMemo(() => {
    if (searchQuery.trim()) {
      return `${filtered.length} hasil pencarian`;
    }
    return `${filtered.length} layanan ditampilkan`;
  }, [filtered.length, searchQuery]);

  const emptyMessage = searchQuery.trim()
    ? "Tidak ada layanan yang cocok dengan pencarian."
    : filter === "Aktif"
      ? "Belum ada layanan aktif."
      : filter === "Nonaktif"
        ? "Belum ada layanan nonaktif."
        : "Belum ada layanan terdaftar.";

  function handleAdd() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(service: ClinicService) {
    setEditData(service);
    setModalOpen(true);
  }

  async function handleSave(input: ServiceFormInput) {
    const isEdit = !!editData;
    setSaving(true);
    try {
      await upsert({
        id: editData?.id,
        ...input,
      });
      setModalOpen(false);
      setEditData(null);
      notifySuccess(isEdit ? "Layanan diperbarui." : "Layanan ditambahkan.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menyimpan layanan");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const ok = await confirmAction({
      title: isActive ? "Aktifkan layanan?" : "Nonaktifkan layanan?",
      message: isActive
        ? "Layanan akan muncul kembali untuk customer saat booking."
        : "Layanan tidak akan bisa dipilih customer hingga diaktifkan lagi.",
      confirmLabel: isActive ? "Aktifkan" : "Nonaktifkan",
      destructive: !isActive,
    });
    if (!ok) return;

    try {
      await setActive(id, isActive);
      notifySuccess(isActive ? "Layanan diaktifkan." : "Layanan dinonaktifkan.");
    } catch (e) {
      notifyError(
        e instanceof Error ? e.message : "Gagal memperbarui status layanan"
      );
    }
  }

  const filterTabs: FilterTab[] = ["Semua", "Aktif", "Nonaktif"];

  return (
    <KlinikPageLayout
      title="Layanan"
      description="Kelola layanan klinik, harga, durasi, dan channel booking"
      actions={
        <KlinikPrimaryButton icon={<Plus size={16} />} onClick={handleAdd}>
          Tambah Layanan
        </KlinikPrimaryButton>
      }
    >
      {error ? <KlinikPageAlert message={error} /> : null}

      {loading ? (
        <KlinikPageLoading message="Memuat layanan..." />
      ) : (
        <>
          <ServiceStatCard stats={stats} />

          <KlinikFilterTabs
            tabs={filterTabs}
            active={filter}
            onChange={setFilter}
            trailing={
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 min-w-[200px]">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  role="searchbox"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, channel, harga..."
                  className="text-sm text-gray-700 outline-none bg-transparent w-full min-w-0"
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                    aria-label="Hapus pencarian"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>
            }
          />

          <KlinikSectionCard
            title="Daftar Layanan"
            description={listDescription}
          >
            <div className="px-5 pb-5 pt-5">
              <ServiceGrid
                services={filtered}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                emptyMessage={emptyMessage}
              />
            </div>
          </KlinikSectionCard>
        </>
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
        saving={saving}
      />
    </KlinikPageLayout>
  );
}
