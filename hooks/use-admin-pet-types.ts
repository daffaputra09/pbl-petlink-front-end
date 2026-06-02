"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface PetTypeRow {
  id: string;
  name: string;
  created_at: string;
  clinic_count: number;
}

export function useAdminPetTypes() {
  const [types, setTypes] = useState<PetTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("admin_list_pet_types");
    if (rpcError) {
      setError(rpcError.message);
      setTypes([]);
    } else {
      setTypes((data as PetTypeRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  const upsert = useCallback(
    async (name: string, id?: string) => {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("admin_upsert_pet_type", {
        p_id: id ?? null,
        p_name: name,
      });
      if (rpcError) throw new Error(rpcError.message);
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc(
        "admin_soft_delete_pet_type",
        { p_id: id }
      );
      if (rpcError) throw new Error(rpcError.message);
      await load();
    },
    [load]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { types, loading, error, refresh: load, upsert, remove };
}
