import { Suspense } from "react";
import { KlinikPageLoading } from "@/components/klinik/KlinikPageLayout";

export default function JadwalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<KlinikPageLoading message="Memuat jadwal..." />}>
      {children}
    </Suspense>
  );
}
