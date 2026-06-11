"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchClinicReviewsPage,
  searchClinicReviews,
} from "@/lib/actions/clinic-reviews";
import { matchesReviewSearch } from "@/lib/reviews/matches-search";
import type { ClinicReviewItem, ReviewRatingFilter } from "@/types/review";

const PAGE_SIZE = 20;
const SEARCH_LIMIT = 500;

export function useClinicReviews(options: {
  ratingFilter: ReviewRatingFilter;
  search?: string;
}) {
  const { ratingFilter, search = "" } = options;
  const [items, setItems] = useState<ClinicReviewItem[]>([]);
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
          const rows = await searchClinicReviews({
            ratingFilter,
            limit: SEARCH_LIMIT,
          });
          if (fetchId !== fetchIdRef.current) return;
          const filtered = rows.filter((row) =>
            matchesReviewSearch(row, trimmedSearch)
          );
          setItems(filtered);
          setTotal(filtered.length);
          setHasMore(false);
          pageRef.current = 0;
          return;
        }

        const page = reset ? 0 : pageRef.current + 1;
        const { items: rows, total: count } = await fetchClinicReviewsPage({
          page,
          pageSize: PAGE_SIZE,
          ratingFilter,
        });

        if (fetchId !== fetchIdRef.current) return;

        setTotal(count);
        setItems((prev) => (reset ? rows : [...prev, ...rows]));
        pageRef.current = page;
        setHasMore((page + 1) * PAGE_SIZE < count);
      } catch (e) {
        if (fetchId !== fetchIdRef.current) return;
        setError(e instanceof Error ? e.message : "Gagal memuat ulasan");
        if (reset) setItems([]);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [isSearchMode, ratingFilter, trimmedSearch]
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
