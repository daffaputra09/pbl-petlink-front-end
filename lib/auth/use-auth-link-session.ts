"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HashAuthPayload =
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "error"; message: string }
  | { kind: "empty" };

function parseHashPayload(): HashAuthPayload {
  if (typeof window === "undefined") return { kind: "empty" };

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const error = params.get("error");
  const errorCode = params.get("error_code");
  if (error) {
    if (errorCode === "otp_expired") {
      return {
        kind: "error",
        message:
          "Tautan sudah kedaluwarsa atau sudah pernah dipakai. Minta klinik mengirim ulang undangan. Buka link di jendela incognito / privat jika pernah login sebagai akun lain.",
      };
    }
    const description = params.get("error_description")?.replace(/\+/g, " ");
    return {
      kind: "error",
      message:
        description ||
        "Tautan tidak valid. Minta klinik mengirim ulang undangan.",
    };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    return { kind: "tokens", accessToken, refreshToken };
  }

  return { kind: "empty" };
}

function clearAuthHashFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("error");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

async function sessionIsDoctor(
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "doctor";
}

export function useAuthLinkSession(options?: {
  invalidMessage?: string;
  requireDoctor?: boolean;
}) {
  const invalidMessage =
    options?.invalidMessage ??
    "Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru.";
  const requireDoctor = options?.requireDoctor ?? false;

  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function acceptSession(): Promise<boolean> {
      if (requireDoctor) {
        return sessionIsDoctor(supabase);
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session;
    }

    async function resolveSession() {
      const hashPayload = parseHashPayload();

      if (hashPayload.kind === "error") {
        if (!cancelled) {
          setSessionReady(false);
          setSubmitError(hashPayload.message);
          setChecking(false);
          clearAuthHashFromUrl();
        }
        return;
      }

      // Always clear other accounts (e.g. clinic) before applying invite/recovery link.
      await supabase.auth.signOut({ scope: "global" });

      if (hashPayload.kind === "tokens") {
        const { error } = await supabase.auth.setSession({
          access_token: hashPayload.accessToken,
          refresh_token: hashPayload.refreshToken,
        });

        if (!error && (await acceptSession()) && !cancelled) {
          setSessionReady(true);
          setSubmitError("");
          setChecking(false);
          clearAuthHashFromUrl();
          return;
        }

        if (!cancelled) {
          setSessionReady(false);
          setSubmitError(
            requireDoctor
              ? "Tautan undangan dokter tidak valid untuk akun ini."
              : invalidMessage
          );
          setChecking(false);
          clearAuthHashFromUrl();
        }
        return;
      }

      // Session from /auth/confirm (cookies) after server-side verifyOtp.
      await new Promise((resolve) => setTimeout(resolve, 300));
      if ((await acceptSession()) && !cancelled) {
        setSessionReady(true);
        setSubmitError("");
        setChecking(false);
        return;
      }

      if (!cancelled) {
        setSessionReady(false);
        setSubmitError(invalidMessage);
        setChecking(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        !session ||
        cancelled ||
        !(event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        return;
      }

      if (await acceptSession()) {
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
  }, [invalidMessage, requireDoctor]);

  return { checking, sessionReady, submitError, setSubmitError };
}
