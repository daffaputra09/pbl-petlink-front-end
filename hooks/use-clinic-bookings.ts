"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { fetchCustomerNamesById } from "@/lib/booking/fetch-customer-names";
import { fetchPaymentStatusByBookingId } from "@/lib/booking/fetch-payment-status";
import {
  BOOKING_LIST_SELECT,
  mapBookingRow,
} from "@/lib/booking/mappers";
import type { Booking } from "@/types/booking";
export function useClinicBookings() {
  const { profile } = useClinicSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      await supabase.rpc("sync_clinic_bookings_in_progress");
    } catch {
      // Migration belum diterapkan — jangan gagalkan fetch.
    }

    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select(BOOKING_LIST_SELECT)
      .eq("clinic_id", profile.id)
      .order("scheduled_start_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const bookingIds = rows.map((r) => r.id as string);
    const customerIds = rows.map((r) => r.customer_id as string);

    const [paymentByBooking, nameByCustomer] = await Promise.all([
      fetchPaymentStatusByBookingId(supabase, bookingIds, profile.id),
      fetchCustomerNamesById(supabase, customerIds),
    ]);

    const mapped = rows.map((row) => {
      const customerId = row.customer_id as string;
      const b = mapBookingRow(row, {
        ownerName: nameByCustomer[customerId],
        paymentStatus: paymentByBooking[row.id as string] ?? null,
      });
      b.customerId = customerId;
      return b;
    });
    setBookings(mapped);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const dbStatus =
      status === "Selesai"
        ? "completed"
        : status === "Dibatalkan"
          ? "cancelled"
          : status === "Terjadwal"
            ? "confirmed"
            : "in_progress";

    const { error: rpcError } = await supabase.rpc("clinic_update_booking_status", {
      p_booking_id: id,
      p_status: dbStatus,
    });
    if (rpcError) throw rpcError;
    await refresh();
  };

  const reschedule = async (
    id: string,
    tanggal: string,
    jamMulai: string,
    jamSelesai: string
  ) => {
    const start = new Date(`${tanggal}T${jamMulai}:00`);
    const end = new Date(`${tanggal}T${jamSelesai}:00`);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("clinic_reschedule_booking", {
      p_booking_id: id,
      p_scheduled_start_at: start.toISOString(),
      p_scheduled_end_at: end.toISOString(),
    });
    if (rpcError) throw rpcError;
    await refresh();
  };

  const createManual = async (payload: {
    customerId: string;
    petId: string;
    doctorId?: string;
    serviceIds: string[];
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    notes?: string;
  }) => {
    const start = new Date(`${payload.tanggal}T${payload.jamMulai}:00`);
    const end = new Date(`${payload.tanggal}T${payload.jamSelesai}:00`);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("create_clinic_manual_booking", {
      p_payload: {
        customer_id: payload.customerId,
        pet_id: payload.petId,
        doctor_id: payload.doctorId ?? null,
        service_ids: payload.serviceIds,
        scheduled_start_at: start.toISOString(),
        scheduled_end_at: end.toISOString(),
        channel: "clinic",
        notes: payload.notes ?? null,
      },
    });
    if (rpcError) throw rpcError;
    await refresh();
  };

  return {
    bookings,
    loading,
    error,
    refresh,
    updateStatus,
    reschedule,
    createManual,
  };
}
