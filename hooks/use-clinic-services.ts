"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";

export interface ClinicServiceRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  isClinicService: boolean;
  isHomeService: boolean;
}

export function useClinicServices() {
  const { profile } = useClinicSession();
  const [services, setServices] = useState<ClinicServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, name, description, price, duration_minutes, is_active, is_clinic_service, is_home_service"
      )
      .eq("clinic_id", profile.id)
      .order("name");

    if (!error && data) {
      setServices(
        data.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: Number(s.price),
          durationMinutes: s.duration_minutes,
          isActive: s.is_active,
          isClinicService: s.is_clinic_service,
          isHomeService: s.is_home_service,
        }))
      );
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = async (input: {
    id?: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    isClinicService: boolean;
    isHomeService: boolean;
    isActive?: boolean;
  }) => {
    if (!profile) return;
    const supabase = createClient();
    const row = {
      clinic_id: profile.id,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      duration_minutes: input.durationMinutes,
      is_clinic_service: input.isClinicService,
      is_home_service: input.isHomeService,
      is_active: input.isActive ?? true,
    };

    if (input.id) {
      const { error } = await supabase
        .from("services")
        .update(row)
        .eq("id", input.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("services").insert(row);
      if (error) throw error;
    }
    await refresh();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  return { services, loading, refresh, upsert, remove };
}
