import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import StatCards from "@/components/layanan/StatCards";
import ServiceCards from "@/components/layanan/ServiceCards";

export const metadata: Metadata = {
  title: "PetLink",
  description: "Kelola dan perbarui layanan medis dan harga klinik Anda.",
};

export default function LayananPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Layanan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola dan perbarui layanan medis dan harga klinik Anda.
          </p>
        </div>
        <Link href="/klinik/layanan/tambah">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
            Tambah Layanan
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Service Cards Grid */}
      <ServiceCards />
    </div>
  );
}