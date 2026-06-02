"use client";

import { ClinicSessionProvider } from "@/lib/auth/clinic-session";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClinicSessionProvider>{children}</ClinicSessionProvider>;
}
