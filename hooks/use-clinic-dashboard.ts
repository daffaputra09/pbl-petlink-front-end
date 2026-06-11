"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { fetchClinicDashboard } from "@/lib/dashboard/fetch-clinic-dashboard";
import type { ClinicDashboardData } from "@/types/dashboard";

export function useClinicDashboard() {
  const { profile, loading: sessionLoading } = useClinicSession();
  const [data, setData] = useState<ClinicDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile) {
      if (!sessionLoading) setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const result = await fetchClinicDashboard(supabase, profile.id);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [profile, sessionLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading: loading || sessionLoading,
    error,
    refresh,
    clinicName: profile?.name ?? "Klinik",
  };
}
