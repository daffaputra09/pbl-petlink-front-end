"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { fetchClinicIncome } from "@/lib/keuangan/fetch-income";
import type { Pendapatan } from "@/types/keuangan";

export function useClinicIncome(options: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const { limit = 20, offset = 0, search = "" } = options;
  const { profile } = useClinicSession();
  const [items, setItems] = useState<Pendapatan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const result = await fetchClinicIncome(supabase, profile.id, {
        limit,
        offset,
        search,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pendapatan");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [profile, limit, offset, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  return { items, total, loading, error, refresh: load };
}
