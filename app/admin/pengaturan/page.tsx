"use client";

import { Settings } from "lucide-react";
import { ChangePasswordCard } from "@/components/pengaturan/ChangePasswordCard";
import { useAdminSession } from "@/lib/auth/admin-session";

export default function AdminPengaturanPage() {
  const { loading } = useAdminSession();

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-emerald-700 mb-2">
          <Settings size={20} />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Pengaturan
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Keamanan Akun</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola kata sandi login admin PetLink
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat...</p>
      ) : (
        <ChangePasswordCard />
      )}
    </div>
  );
}
