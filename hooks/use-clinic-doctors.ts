"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import type { Doctor, DoctorStatus } from "@/types/dokter";

function mapStatus(isActive: boolean): DoctorStatus {
  return isActive ? "Bertugas" : "Cuti";
}

export function useClinicDoctors() {
  const { profile } = useClinicSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("doctor_profiles")
      .select(
        `
        id, bio, specialization, is_active,
        profiles ( name, image_url )
      `
      )
      .eq("clinic_id", profile.id);

    if (!error && data) {
      setDoctors(
        data.map((d) => {
          const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
          return {
            id: d.id,
            nama: p?.name ?? "Dokter",
            email: "",
            phone: "",
            spesialisasi: d.specialization
              ? [d.specialization]
              : ["General Praktek"],
            status: mapStatus(d.is_active),
            jadwal: [],
            biografi: d.bio ?? undefined,
            photo: p?.image_url ?? undefined,
          };
        })
      );
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { doctors, loading, refresh };
}

export function useDoctorSchedules(doctorId: string | null) {
  const [schedules, setSchedules] = useState<
    {
      id: string;
      startsAt: string;
      endsAt: string;
      notes: string | null;
      bookingId: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("doctor_schedules")
      .select("id, starts_at, ends_at, notes, booking_id")
      .eq("doctor_id", doctorId)
      .order("starts_at");

    setSchedules(
      (data ?? []).map((s) => ({
        id: s.id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        notes: s.notes,
        bookingId: s.booking_id,
      }))
    );
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveBlock = async (input: {
    id?: string;
    startsAt: string;
    endsAt: string;
    notes?: string;
  }) => {
    const supabase = createClient();
    if (input.id) {
      await supabase
        .from("doctor_schedules")
        .update({
          starts_at: input.startsAt,
          ends_at: input.endsAt,
          notes: input.notes ?? null,
        })
        .eq("id", input.id);
    } else if (doctorId) {
      await supabase.from("doctor_schedules").insert({
        doctor_id: doctorId,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        notes: input.notes ?? null,
      });
    }
    await refresh();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("doctor_schedules").delete().eq("id", id);
    await refresh();
  };

  return { schedules, loading, refresh, saveBlock, remove };
}
