"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthLinkFlow = "invite" | "recovery";

type HashAuthPayload =
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "error"; message: string }
  | { kind: "empty" };

function flowExpiredMessage(flow: AuthLinkFlow): string {
  if (flow === "recovery") {
    return "Tautan reset sudah kedaluwarsa atau sudah pernah dipakai. Minta tautan baru dari halaman lupa kata sandi. Buka link di jendela incognito jika pernah login sebagai akun lain di browser yang sama.";
  }
  return "Tautan undangan sudah kedaluwarsa atau sudah pernah dipakai. Minta klinik mengirim ulang undangan. Buka link di jendela incognito jika pernah login sebagai akun lain.";
}

function parseHashPayload(flow: AuthLinkFlow): HashAuthPayload {
  if (typeof window === "undefined") return { kind: "empty" };

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const error = params.get("error");
  const errorCode = params.get("error_code");
  if (error) {
    if (errorCode === "otp_expired") {
      return { kind: "error", message: flowExpiredMessage(flow) };
    }
    const description = params.get("error_description")?.replace(/\+/g, " ");
    return {
      kind: "error",
      message:
        description ||
        (flow === "recovery"
          ? "Tautan reset tidak valid. Minta tautan baru."
          : "Tautan undangan tidak valid. Minta klinik mengirim ulang."),
    };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    return { kind: "tokens", accessToken, refreshToken };
  }

  return { kind: "empty" };
}

function clearAuthParamsFromUrl() {
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

    async function waitForSession(ms: number): Promise<boolean> {
      await new Promise((resolve) => setTimeout(resolve, ms));
      return acceptSession();
    }

    async function resolveSession() {
      const queryError =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("error")
          : null;

      if (queryError === "invalid_link") {
        if (!cancelled) {
          setSessionReady(false);
          setSubmitError(invalidMessage);
          setChecking(false);
        }
        return;
      }

      const hashPayload = parseHashPayload(flow);

      if (hashPayload.kind === "error") {
        if (!cancelled) {
          setSessionReady(false);
          setSubmitError(hashPayload.message);
          setChecking(false);
          clearAuthParamsFromUrl();
        }
        return;
      }

      if (hashPayload.kind === "tokens") {
        // Implicit flow: clear conflicting portal session, then apply tokens from hash.
        await supabase.auth.signOut({ scope: "global" });

        const { error } = await supabase.auth.setSession({
          access_token: hashPayload.accessToken,
          refresh_token: hashPayload.refreshToken,
        });

        if (!error && (await acceptSession()) && !cancelled) {
          setSessionReady(true);
          setSubmitError("");
          setChecking(false);
          clearAuthParamsFromUrl();
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
          clearAuthParamsFromUrl();
        }
        return;
      }

      // PKCE / accept-invite flow: session was set server-side in /auth/confirm cookies.
      // Do NOT sign out here — that would destroy the recovery/invite session.
      if (await waitForSession(300)) {
        if (!cancelled) {
          setSessionReady(true);
          setSubmitError("");
          setChecking(false);
          clearAuthParamsFromUrl();
        }
        return;
      }

      if (await waitForSession(900)) {
        if (!cancelled) {
          setSessionReady(true);
          setSubmitError("");
          setChecking(false);
          clearAuthParamsFromUrl();
        }
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
        clearAuthParamsFromUrl();
      }
    });

    void resolveSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [invalidMessage, requireDoctor, flow]);

  return { checking, sessionReady, submitError, setSubmitError };
}
