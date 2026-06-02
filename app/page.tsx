import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center">
          <PawPrint className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">PetLink Klinik</h1>
      </div>
      <p className="text-gray-500 text-center max-w-md mb-8">
        Portal manajemen klinik hewan — kelola booking, dokter, layanan, dan
        keuangan klinik Anda.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="px-6 py-2.5 border border-emerald-600 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
        >
          Daftar Klinik
        </Link>
      </div>
    </div>
  );
}
