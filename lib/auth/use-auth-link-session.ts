"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function hashHasAuthTokens(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return false;
  const params = new URLSearchParams(hash);
  return (
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.get("type") === "invite" ||
    params.get("type") === "recovery"
  );
}

function clearAuthHashFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("error");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

/**
 * Resolves a Supabase auth session from invite/recovery links.
 * Handles implicit flow (#access_token in hash) and PKCE (?code via callback).
 */
export function useAuthLinkSession(options?: {
  invalidMessage?: string;
}) {
  const invalidMessage =
    options?.invalidMessage ??
    "Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru.";

  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const hasHashTokens = hashHasAuthTokens();

    async function resolveSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && !cancelled) {
        setSessionReady(true);
        setSubmitError("");
        setChecking(false);
        clearAuthHashFromUrl();
        return;
      }

      // Implicit flow: wait for client to parse #access_token from hash.
      if (hasHashTokens) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const {
          data: { session: hashSession },
        } = await supabase.auth.getSession();

        if (hashSession && !cancelled) {
          setSessionReady(true);
          setSubmitError("");
          setChecking(false);
          clearAuthHashFromUrl();
          return;
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession();

        if (retrySession && !cancelled) {
          setSessionReady(true);
          setSubmitError("");
          setChecking(false);
          clearAuthHashFromUrl();
          return;
        }
      }

      if (!cancelled) {
        setSessionReady(false);
        setSubmitError(invalidMessage);
        setChecking(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        !cancelled &&
        (event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "TOKEN_REFRESHED")
      ) {
        setSessionReady(true);
        setSubmitError("");
        setChecking(false);
        clearAuthHashFromUrl();
      }
    });

    void resolveSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [invalidMessage]);

  return { checking, sessionReady, submitError, setSubmitError };
}
