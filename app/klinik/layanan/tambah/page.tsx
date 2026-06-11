"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Halaman legacy — redirect ke manajemen layanan (modal). */
export default function TambahLayananRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/klinik/layanan");
  }, [router]);

  return (
    <p className="p-6 text-sm text-gray-500">Mengalihkan ke Manajemen Layanan...</p>
  );
}
