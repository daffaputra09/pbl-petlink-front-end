import { Suspense } from "react";

export default function JadwalLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-6">Memuat...</div>}>{children}</Suspense>;
}
