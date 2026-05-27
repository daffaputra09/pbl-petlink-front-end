import { ReactNode } from "react";

export default function DokterLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Judul & deskripsi dihandle langsung di DoctorTable */}
        </div>
      </div>

      {children}
    </main>
  );
}
