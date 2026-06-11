"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import type { ClinicService, ServiceFormInput } from "@/types/layanan";

function mapRow(row: Record<string, unknown>): ClinicService {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    price:
      typeof row.price === "number"
        ? row.price
        : Number.parseFloat(String(row.price ?? 0)) || 0,
    durationMinutes: row.duration_minutes as number,
    isActive: (row.is_active as boolean) ?? true,
    isClinicService: (row.is_clinic_service as boolean) ?? false,
    isHomeService: (row.is_home_service as boolean) ?? false,
  };
}

export function useClinicServices() {
  const { profile } = useClinicSession();
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("services")
      .select(
        "id, name, description, price, duration_minutes, is_active, is_clinic_service, is_home_service"
      )
      .eq("clinic_id", profile.id)
      .order("name");

    if (fetchError) {
      setError(fetchError.message);
      setServices([]);
    } else {
      setServices((data ?? []).map((row) => mapRow(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = async (input: ServiceFormInput & { id?: string }) => {
    if (!profile) throw new Error("Sesi klinik tidak valid.");
    if (!input.isClinicService && !input.isHomeService) {
      throw new Error("Pilih minimal satu channel: Klinik atau Home Service.");
    }

    const supabase = createClient();
    const row = {
      clinic_id: profile.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      duration_minutes: input.durationMinutes,
      is_clinic_service: input.isClinicService,
      is_home_service: input.isHomeService,
      is_active: input.isActive,
    };

    if (input.id) {
      const { error: updateError } = await supabase
        .from("services")
        .update(row)
        .eq("id", input.id)
        .eq("clinic_id", profile.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("services").insert(row);
      if (insertError) throw insertError;
    }
    await refresh();
  };

  const setActive = async (id: string, isActive: boolean) => {
    if (!profile) return;
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("services")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("clinic_id", profile.id);
    if (updateError) throw updateError;
    await refresh();
  };

  return { services, loading, error, refresh, upsert, setActive };
}

/** @deprecated Use ClinicService from @/types/layanan */
export type ClinicServiceRow = ClinicService;
