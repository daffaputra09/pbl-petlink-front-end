"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  Calendar,
  FileText,
  Ban,
  CheckCircle2,
  Loader2,
  Hourglass,
} from "lucide-react";
import { AdminPageSearch } from "@/components/layout/AdminPageSearch";
import { useAdminClinics } from "@/hooks/use-admin-clinics";
import { formatDateShort } from "@/lib/admin/format";

export default function AdminKlinikPage() {
  const [tab, setTab] = useState<"all" | "inactive">("all");
  const [search, setSearch] = useState("");
  const { clinics, loading, error, setActive } = useAdminClinics(tab);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clinics;
    return clinics.filter(
      (c) =>
        c.clinic_name.toLowerCase().includes(q) ||
        (c.address ?? "").toLowerCase().includes(q)
    );
  }, [clinics, search]);

  async function toggleActive(id: string, currentlyActive: boolean) {
    setBusyId(id);
    try {
      await setActive(id, !currentlyActive);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Klinik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tinjau dan kelola pendaftaran klinik hewan.
          </p>
        </div>
        <AdminPageSearch
          placeholder="Cari klinik atau pemilik..."
          value={search}
          onChange={setSearch}
        />
      </div>

        <div className="flex gap-2 mb-6">
          {(["all", "inactive"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                tab === t
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {t === "all" ? "Semua" : "Nonaktif"}
            </button>
          ))}
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
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-16">
            Tidak ada klinik ditemukan.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {c.clinic_name}
                    </h3>
                    <p className="text-sm text-gray-500">{c.owner_name}</p>
                  </div>
                  {c.is_active ? (
                    c.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                        <CheckCircle2 size={12} />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-full shrink-0">
                        <Hourglass size={12} />
                        Pending
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full shrink-0">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 flex-1">
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-gray-400" />
                    <span className="line-clamp-2">
                      {c.address || "Alamat belum diisi"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0 text-gray-400" />
                    Terdaftar: {formatDateShort(c.registered_at)}
                  </p>
                  {c.image_url && (
                    <a
                      href={c.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-700 hover:underline"
                    >
                      <FileText size={14} />
                      Lihat foto profil klinik
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  disabled={busyId === c.id}
                  onClick={() => toggleActive(c.id, c.is_active)}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition ${
                    c.is_active
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {busyId === c.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Ban size={16} />
                  )}
                  {c.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
