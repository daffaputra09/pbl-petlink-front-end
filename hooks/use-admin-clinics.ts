"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AdminClinicRow {
  id: string;
  clinic_name: string;
  owner_name: string;
  address: string | null;
  is_verified: boolean;
  is_active: boolean;
  image_url: string | null;
  registered_at: string;
}

export function useAdminClinics(filter: "all" | "inactive") {
  const [clinics, setClinics] = useState<AdminClinicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("admin_list_clinics", {
      p_filter: filter,
    });
    if (rpcError) {
      setError(rpcError.message);
      setClinics([]);
    } else {
      setClinics((data as AdminClinicRow[]) ?? []);
    }
    setLoading(false);
  }, [filter]);

  const setActive = useCallback(
    async (clinicId: string, active: boolean) => {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("admin_set_clinic_active", {
        p_clinic_id: clinicId,
        p_active: active,
      });
      if (rpcError) throw new Error(rpcError.message);
      await load();
    },
    [load]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { clinics, loading, error, refresh: load, setActive };
}
