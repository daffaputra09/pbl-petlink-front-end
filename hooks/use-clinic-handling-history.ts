"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listClinicDoctorHandlingHistory } from "@/lib/actions/clinic-history";
import { matchesHandlingSearch } from "@/lib/riwayat/presentation";
import type {
  HandlingHistoryEntry,
  HandlingKindFilter,
  RiwayatStatusFilter,
} from "@/types/riwayat";

const PAGE_SIZE = 20;

export function useClinicHandlingHistory(options: {
  statusFilter: RiwayatStatusFilter;
  kindFilter: HandlingKindFilter;
  doctorId?: string | null;
  search?: string;
}) {
  const { statusFilter, kindFilter, doctorId, search = "" } = options;
  const [allItems, setAllItems] = useState<HandlingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE);
    try {
      const rows = await listClinicDoctorHandlingHistory({
        statusFilter,
        kindFilter,
        doctorId,
      });
      setAllItems(rows);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal memuat riwayat penanganan"
      );
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, kindFilter, doctorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => {
    const q = search.trim();
    if (!q) return allItems;
    return allItems.filter((item) => matchesHandlingSearch(item, q));
  }, [allItems, search]);

  const items = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  return {
    items,
    loading,
    error,
    total: filteredItems.length,
    hasMore,
    loadMore,
    isSearchMode: search.trim().length > 0,
  };
}
