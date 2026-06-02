"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import StatCards from "@/components/layanan/ServiceStatCard";
import ServiceCards from "@/components/layanan/ServiceCard";
import { useClinicServices } from "@/hooks/use-clinic-services";
import {
  buildServiceStats,
  clinicServiceToCard,
} from "@/lib/layanan/presentation";

export default function LayananPage() {
  const { services, loading, remove } = useClinicServices();
  const cards = services.map(clinicServiceToCard);
  const stats = buildServiceStats(services);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Layanan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola dan perbarui layanan medis dan harga klinik Anda.
          </p>
        </div>
        <Link href="/klinik/layanan/tambah">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Layanan
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat layanan...</p>
      ) : (
        <>
          <StatCards stats={stats} />
          <ServiceCards
            data={cards}
            onDelete={async (id) => {
              if (confirm("Hapus layanan ini?")) {
                await remove(String(id));
              }
            }}
          />
        </>
      )}
    </div>
  );
}
