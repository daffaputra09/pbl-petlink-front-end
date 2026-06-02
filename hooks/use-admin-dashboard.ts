"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface MonthlyPoint {
  month: number;
  label: string;
  amount: number;
}

export interface DashboardStats {
  total_clinics: number;
  total_users: number;
  total_revenue: number;
  revenue_this_month: number;
  revenue_prev_month: number;
  revenue_growth_percent: number | null;
  clinics_this_month: number;
  users_this_month: number;
  year: number;
  monthly: MonthlyPoint[];
}

export interface ActivityItem {
  kind: string;
  title: string;
  subtitle: string;
  sort_at: string;
  reference_id: string;
}

export function useAdminDashboard(year?: number) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const statsRes = await supabase.rpc("admin_dashboard_stats", {
      p_year: year ?? new Date().getFullYear(),
    });
    if (statsRes.error) {
      setError(statsRes.error.message);
      setLoading(false);
      return;
    }

    const actRes = await supabase.rpc("admin_recent_activity", { p_limit: 8 });
    if (actRes.error) {
      setError(actRes.error.message);
    } else {
      setActivity((actRes.data as ActivityItem[]) ?? []);
    }

    setStats(statsRes.data as DashboardStats);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, activity, loading, error, refresh: load };
}
