"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlatformFeeRow, PlatformFeeStats } from "@/types/platform-fee";

export function useAdminPlatformFeeStats(year?: number) {
  const [stats, setStats] = useState<PlatformFeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc(
      "admin_platform_fee_stats",
      { p_year: year ?? new Date().getFullYear() }
    );
    if (rpcError) {
      setError(rpcError.message);
      setStats(null);
    } else {
      setStats(data as PlatformFeeStats);
    }
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}

export function useAdminPlatformFeeList(options: {
  search?: string;
  referenceType?: "booking" | "consultation" | null;
  limit?: number;
  offset?: number;
}) {
  const {
    search = "",
    referenceType = null,
    limit = 20,
    offset = 0,
  } = options;
  const [items, setItems] = useState<PlatformFeeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc(
      "admin_list_platform_fees",
      {
        p_search: search.trim() || null,
        p_reference_type: referenceType,
        p_limit: limit,
        p_offset: offset,
      }
    );
    if (rpcError) {
      setError(rpcError.message);
      setItems([]);
      setTotal(0);
    } else {
      const payload = data as { items: PlatformFeeRow[]; total: number };
      setItems(payload?.items ?? []);
      setTotal(Number(payload?.total ?? 0));
    }
    setLoading(false);
  }, [search, referenceType, limit, offset]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return { items, total, loading, error, refresh: load };
}
