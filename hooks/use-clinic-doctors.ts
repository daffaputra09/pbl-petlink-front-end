"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listClinicDoctorBookedSchedules,
  listClinicDoctors,
} from "@/lib/actions/invite-doctor";
import type { Doctor, DoctorScheduleEntry } from "@/types/dokter";

export function useClinicDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listClinicDoctors();
      setDoctors(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat dokter.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { doctors, loading, error, refresh };
}

export function useClinicDoctorBookedSchedules() {
  const [schedules, setSchedules] = useState<DoctorScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listClinicDoctorBookedSchedules();
      setSchedules(data);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { schedules, loading, refresh };
}
