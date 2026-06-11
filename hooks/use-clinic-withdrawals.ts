"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { fetchClinicWithdrawals } from "@/lib/keuangan/fetch-withdrawals";
import type { HistoryPenarikan } from "@/types/keuangan";

import type { WithdrawFilterValue } from "@/lib/keuangan/withdraw-status";

export function useClinicWithdrawals(options: {
  limit?: number;
  offset?: number;
  status?: WithdrawFilterValue;
}) {
  const { limit = 20, offset = 0, status = null } = options;
  const { profile } = useClinicSession();
  const [items, setItems] = useState<HistoryPenarikan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const result = await fetchClinicWithdrawals(supabase, profile.id, {
        limit,
        offset,
        status,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat penarikan");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [profile, limit, offset, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, total, loading, error, refresh: load };
}
