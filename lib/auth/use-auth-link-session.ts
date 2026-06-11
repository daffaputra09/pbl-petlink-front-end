"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

type AuthLinkFlow = "invite" | "recovery";

// All auth events that carry a valid session we can use.
const VALID_SESSION_EVENTS: AuthChangeEvent[] = [
  "INITIAL_SESSION",
  "SIGNED_IN",
  "TOKEN_REFRESHED",
  // PKCE recovery flow fires this instead of SIGNED_IN
  "PASSWORD_RECOVERY",
];

function flowExpiredMessage(flow: AuthLinkFlow): string {
  if (flow === "recovery") {
    return "Tautan reset sudah kedaluwarsa atau sudah pernah dipakai. Minta tautan baru dari halaman lupa kata sandi.";
  }
  return "Tautan undangan sudah kedaluwarsa atau sudah pernah dipakai. Minta klinik mengirim ulang undangan.";
}

function parseQueryError(flow: AuthLinkFlow): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);

  const errorCode = params.get("error_code");
  const error = params.get("error");

  if (error === "invalid_link") {
    return flow === "recovery"
      ? "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru."
      : "Tautan undangan tidak valid atau sudah kedaluwarsa.";
  }
  if (errorCode === "otp_expired" || error === "access_denied") {
    return flowExpiredMessage(flow);
  }
  const description = params.get("error_description")?.replace(/\+/g, " ");
  if (description) return description;
  return null;
}

function parseHashError(flow: AuthLinkFlow): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const error = params.get("error");
  if (!error) return null;
  const errorCode = params.get("error_code");
  if (errorCode === "otp_expired") return flowExpiredMessage(flow);
  const description = params.get("error_description")?.replace(/\+/g, " ");
  return (
    description ||
    (flow === "recovery"
      ? "Tautan reset tidak valid. Minta tautan baru."
      : "Tautan undangan tidak valid. Minta klinik mengirim ulang.")
  );
}

function parseHashTokens(): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const at = params.get("access_token");
  const rt = params.get("refresh_token");
  return at && rt ? { accessToken: at, refreshToken: rt } : null;
}

function clearAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  for (const key of ["error", "error_code", "error_description", "code"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

export function useAuthLinkSession(options?: {
  invalidMessage?: string;
  requireDoctor?: boolean;
  flow?: AuthLinkFlow;
}) {
  const flow = options?.flow ?? "recovery";
  const invalidMessage =
    options?.invalidMessage ??
    (flow === "recovery"
      ? "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman lupa kata sandi."
      : "Tautan tidak valid atau sudah kedaluwarsa. Hubungi klinik untuk mengirim ulang undangan.");
  const requireDoctor = options?.requireDoctor ?? false;

  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Prevent race: only the first resolve wins.
  const resolvedRef = useRef(false);

  useEffect(() => {
    resolvedRef.current = false;

    const supabase = createClient();
    let cancelled = false;

    function accept() {
      if (cancelled || resolvedRef.current) return;
      resolvedRef.current = true;
      setSessionReady(true);
      setSubmitError("");
      setChecking(false);
      clearAuthParamsFromUrl();
    }

    function reject(message: string) {
      if (cancelled || resolvedRef.current) return;
      resolvedRef.current = true;
      setSessionReady(false);
      setSubmitError(message);
      setChecking(false);
      clearAuthParamsFromUrl();
    }

    // Verify the current session via getUser() (API call — reliable after PKCE cookie exchange).
    async function verifyCurrentUser(): Promise<boolean> {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return false;

      if (requireDoctor) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        return profile?.role === "doctor";
      }
      return true;
    }

    async function resolveSession() {
      // 1. Error params in query string (?error_code=otp_expired, etc.)
      const queryError = parseQueryError(flow);
      if (queryError) {
        reject(queryError);
        return;
      }

      // 2. Error in URL hash (#error=access_denied, etc.)
      const hashError = parseHashError(flow);
      if (hashError) {
        reject(hashError);
        return;
      }

      // 3. PKCE code landed directly on this page (edge case).
      //    Redirect to /auth/callback to exchange it server-side.
      const pkceCode =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("code")
          : null;
      if (pkceCode) {
        const cb = new URL("/auth/callback", window.location.origin);
        cb.searchParams.set("code", pkceCode);
        cb.searchParams.set("next", window.location.pathname);
        window.location.replace(cb.toString());
        return;
      }

      // 4. Implicit flow: tokens in hash (#access_token=...).
      const hashTokens = parseHashTokens();
      if (hashTokens) {
        // Sign out any conflicting portal session first.
        await supabase.auth.signOut({ scope: "global" });
        const { error } = await supabase.auth.setSession({
          access_token: hashTokens.accessToken,
          refresh_token: hashTokens.refreshToken,
        });
        if (!error && !cancelled && (await verifyCurrentUser())) {
          accept();
        } else if (!cancelled) {
          reject(
            requireDoctor
              ? "Tautan undangan dokter tidak valid untuk akun ini."
              : invalidMessage
          );
        }
        return;
      }

      // 5. PKCE exchange was done server-side in /auth/callback.
      //    Session is in cookies — getUser() will confirm via API call.
      //    Try immediately, then with increasing delays.
      for (const ms of [0, 400, 1200, 2500]) {
        if (cancelled || resolvedRef.current) return;
        if (ms > 0) await new Promise((r) => setTimeout(r, ms));
        if (cancelled || resolvedRef.current) return;
        if (await verifyCurrentUser()) {
          accept();
          return;
        }
      }

      if (!cancelled && !resolvedRef.current) {
        reject(invalidMessage);
      }
    }

    // Subscribe FIRST so we don't miss early events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled || resolvedRef.current) return;
      if (!session || !VALID_SESSION_EVENTS.includes(event)) return;

      // For PASSWORD_RECOVERY (PKCE recovery), accept immediately if session is present.
      if (await verifyCurrentUser()) {
        accept();
      }
    });

    void resolveSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [flow, invalidMessage, requireDoctor]);

  return { checking, sessionReady, submitError, setSubmitError };
}
