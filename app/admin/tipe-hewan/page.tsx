"use client";

import { useState } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useAdminPetTypes } from "@/hooks/use-admin-pet-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/lib/ui/confirm-store";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

function dotColor(count: number) {
  if (count >= 100) return "bg-emerald-500";
  if (count >= 30) return "bg-amber-400";
  return "bg-gray-400";
}

export default function AdminTipeHewanPage() {
  const { types, loading, error, upsert, remove } = useAdminPetTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditId(null);
    setName("");
    setModalOpen(true);
  }

  function openEdit(id: string, currentName: string) {
    setEditId(id);
    setName(currentName);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await upsert(name.trim(), editId ?? undefined);
      setModalOpen(false);
      notifySuccess(editId ? "Tipe hewan diperbarui." : "Tipe hewan ditambahkan.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    const ok = await confirmAction({
      title: "Hapus tipe hewan?",
      message: `Tipe "${label}" akan dihapus dari sistem.`,
      confirmLabel: "Hapus",
      destructive: true,
    });
    if (!ok) return;
    try {
      await remove(id);
      notifySuccess("Tipe hewan dihapus.");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="border-l-4 border-emerald-600 pl-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Kelola Tipe Hewan
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-xl">
              Atur kategori hewan yang didukung oleh sistem PetLink. Kategori
              ini menentukan spesialisasi klinik yang tersedia bagi pengguna.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
          >
            <Plus size={18} className="mr-2" />
            Tambah Tipe Baru
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 group relative"
              >
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => openEdit(t.id, t.name)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-gray-600"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                    aria-label="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 pr-16">
                  {t.name}
                </h3>
                <p className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                  <span
                    className={`w-2 h-2 rounded-full ${dotColor(Number(t.clinic_count))}`}
                  />
                  {Number(t.clinic_count)} Klinik Terdaftar
                </p>
              </div>
            ))}

            <button
              type="button"
              onClick={openCreate}
              className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50 transition min-h-[140px]"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-gray-400">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium text-gray-500">
                Tambah Tipe Baru
              </span>
            </button>
          </div>
        )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Tipe Hewan" : "Tambah Tipe Hewan"}
            </DialogTitle>
          </DialogHeader>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama tipe hewan"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
