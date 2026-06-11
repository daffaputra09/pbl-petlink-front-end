"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import {
  BOOKINGS_PAGE_SIZE,
  BOOKINGS_SEARCH_LIMIT,
  fetchClinicBookingsPage,
} from "@/lib/booking/fetch-clinic-bookings-page";
import {
  fetchBookingStats,
  type BookingStats,
} from "@/lib/booking/fetch-booking-stats";
import { matchesBookingSearch } from "@/lib/booking/matches-search";
import type { Booking, BookingStatus } from "@/types/booking";

type StatusFilter = BookingStatus | "Semua";

export interface UseClinicBookingsOptions {
  /** Jika false, hanya mutasi — tidak fetch daftar (hemat untuk halaman lain). */
  listEnabled?: boolean;
  statusFilter?: StatusFilter;
  dateFilter?: string;
  search?: string;
}

const EMPTY_STATS: BookingStats = {
  todayCount: 0,
  upcoming: 0,
  completed: 0,
  revenue: 0,
};

export function useClinicBookings(options: UseClinicBookingsOptions = {}) {
  const {
    listEnabled = true,
    statusFilter = "Semua",
    dateFilter = "",
    search = "",
  } = options;

  const { profile } = useClinicSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(listEnabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BookingStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(listEnabled);
  const pageRef = useRef(0);
  const fetchIdRef = useRef(0);

  const trimmedSearch = search.trim();
  const isSearchMode = trimmedSearch.length > 0;

  const loadStats = useCallback(async () => {
    if (!profile || !listEnabled) return;
    setStatsLoading(true);
    try {
      const supabase = createClient();
      const next = await fetchBookingStats(supabase, profile.id);
      setStats(next);
    } catch {
      // Stats opsional — jangan blokir halaman.
    } finally {
      setStatsLoading(false);
    }
  }, [profile, listEnabled]);

  const fetchList = useCallback(
    async (reset: boolean) => {
      if (!profile || !listEnabled) return;

      const fetchId = ++fetchIdRef.current;
      if (reset) {
        setLoading(true);
        setError(null);
        pageRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      const supabase = createClient();

      try {
        try {
          await supabase.rpc("sync_clinic_bookings_in_progress");
        } catch {
          // Migration belum diterapkan.
        }

        if (isSearchMode) {
          const { bookings: rows, totalCount: count } =
            await fetchClinicBookingsPage(supabase, profile.id, {
              from: 0,
              to: 0,
              statusFilter,
              dateFilter: dateFilter || undefined,
              searchLimit: BOOKINGS_SEARCH_LIMIT,
            });

          if (fetchId !== fetchIdRef.current) return;

          const filtered = rows.filter((b) =>
            matchesBookingSearch(b, trimmedSearch)
          );
          setBookings(filtered);
          setTotalCount(filtered.length);
          setHasMore(false);
          pageRef.current = 0;
          return;
        }

        const page = reset ? 0 : pageRef.current + 1;
        const from = page * BOOKINGS_PAGE_SIZE;
        const to = from + BOOKINGS_PAGE_SIZE - 1;

        const { bookings: rows, totalCount: count } =
          await fetchClinicBookingsPage(supabase, profile.id, {
            from,
            to,
            statusFilter,
            dateFilter: dateFilter || undefined,
          });

        if (fetchId !== fetchIdRef.current) return;

        setTotalCount(count);
        setBookings((prev) => (reset ? rows : [...prev, ...rows]));
        pageRef.current = page;
        setHasMore(from + rows.length < count);
      } catch (e) {
        if (fetchId !== fetchIdRef.current) return;
        setError(e instanceof Error ? e.message : "Gagal memuat booking");
        if (reset) setBookings([]);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [
      profile,
      listEnabled,
      statusFilter,
      dateFilter,
      isSearchMode,
      trimmedSearch,
    ]
  );

  useEffect(() => {
    if (!listEnabled) {
      setLoading(false);
      setStatsLoading(false);
      return;
    }
    void fetchList(true);
  }, [fetchList, listEnabled]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || isSearchMode) return;
    void fetchList(false);
  }, [loading, loadingMore, hasMore, isSearchMode, fetchList]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchList(true), loadStats()]);
  }, [fetchList, loadStats]);

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
    if (listEnabled) await refresh();
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
    if (listEnabled) await refresh();
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
    if (listEnabled) await refresh();
  };

  return {
    bookings,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    error,
    stats,
    statsLoading,
    loadMore,
    refresh,
    updateStatus,
    reschedule,
    createManual,
    isSearchMode,
  };
}
