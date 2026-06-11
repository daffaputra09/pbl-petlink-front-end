"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchClinicConsultationHistoryPage,
  searchClinicConsultationHistory,
} from "@/lib/actions/clinic-history";
import { matchesConsultationSearch } from "@/lib/riwayat/presentation";
import type { ConsultationStatusFilter } from "@/lib/riwayat/consultation-status";
import type { ConsultationHistoryItem } from "@/types/riwayat";

const PAGE_SIZE = 20;
const SEARCH_LIMIT = 500;

export function useClinicConsultationHistory(options: {
  statusFilter: ConsultationStatusFilter;
  doctorId?: string | null;
  search?: string;
}) {
  const { statusFilter, doctorId, search = "" } = options;
  const [items, setItems] = useState<ConsultationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const fetchIdRef = useRef(0);

  const trimmedSearch = search.trim();
  const isSearchMode = trimmedSearch.length > 0;

  const fetchList = useCallback(
    async (reset: boolean) => {
      const fetchId = ++fetchIdRef.current;
      if (reset) {
        setLoading(true);
        setError(null);
        pageRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      try {
        if (isSearchMode) {
          const rows = await searchClinicConsultationHistory({
            statusFilter,
            doctorId,
            limit: SEARCH_LIMIT,
          });
          if (fetchId !== fetchIdRef.current) return;
          const filtered = rows.filter((r) =>
            matchesConsultationSearch(r, trimmedSearch)
          );
          setItems(filtered);
          setTotal(filtered.length);
          setHasMore(false);
          pageRef.current = 0;
          return;
        }

        const page = reset ? 0 : pageRef.current + 1;
        const { items: rows, total: count } =
          await fetchClinicConsultationHistoryPage({
            page,
            pageSize: PAGE_SIZE,
            statusFilter,
            doctorId,
          });

        if (fetchId !== fetchIdRef.current) return;

        setTotal(count);
        setItems((prev) => (reset ? rows : [...prev, ...rows]));
        pageRef.current = page;
        setHasMore((page + 1) * PAGE_SIZE < count);
      } catch (e) {
        if (fetchId !== fetchIdRef.current) return;
        setError(e instanceof Error ? e.message : "Gagal memuat riwayat konsultasi");
        if (reset) setItems([]);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [statusFilter, doctorId, isSearchMode, trimmedSearch]
  );

  useEffect(() => {
    void fetchList(true);
  }, [fetchList]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || isSearchMode) return;
    void fetchList(false);
  }, [fetchList, hasMore, isSearchMode, loading, loadingMore]);

  return {
    items,
    loading,
    loadingMore,
    error,
    total,
    hasMore,
    loadMore,
    isSearchMode,
  };
}
