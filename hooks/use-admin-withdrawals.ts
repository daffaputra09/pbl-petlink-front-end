"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface WithdrawRow {
  id: string;
  clinic_id: string;
  clinic_name: string;
  amount: number;
  status: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code: string | null;
  rejection_reason: string | null;
  created_at: string;
  processed_at: string | null;
  processed_by: string | null;
}

export function useAdminWithdrawals(options: {
  status?: string | null;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { status = null, search = "", limit = 20, offset = 0 } = options;
  const [items, setItems] = useState<WithdrawRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc(
      "admin_list_withdraw_requests",
      {
        p_status: status,
        p_search: search.trim() || null,
        p_limit: limit,
        p_offset: offset,
      }
    );
    if (rpcError) {
      setError(rpcError.message);
      setItems([]);
      setTotal(0);
    } else {
      const payload = data as { items: WithdrawRow[]; total: number };
      setItems(payload?.items ?? []);
      setTotal(Number(payload?.total ?? 0));
    }
    setLoading(false);
  }, [status, search, limit, offset]);

  const processRequest = useCallback(
    async (
      id: string,
      action: "approve" | "reject",
      rejectionReason?: string
    ) => {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc(
        "admin_process_withdraw_request",
        {
          p_id: id,
          p_action: action,
          p_rejection_reason: rejectionReason ?? null,
        }
      );
      if (rpcError) throw new Error(rpcError.message);
      await load();
    },
    [load]
  );

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return { items, total, loading, error, refresh: load, processRequest };
}
