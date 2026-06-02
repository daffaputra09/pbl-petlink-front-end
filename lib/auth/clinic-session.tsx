"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { ClinicProfile } from "./types";

interface ClinicSessionContextValue {
  profile: ClinicProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const ClinicSessionContext = createContext<ClinicSessionContextValue | null>(
  null
);

export function ClinicSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, name, role, image_url, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!data || data.role !== "clinic" || data.is_active === false) {
      setProfile(null);
    } else {
      setProfile({
        id: data.id,
        name: data.name,
        imageUrl: data.image_url,
        role: data.role,
      });
    }
    setLoading(false);
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = "/login";
  }, [supabase]);

  useEffect(() => {
    refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.unsubscribe();
  }, [supabase, refresh]);

  const value = useMemo(
    () => ({ profile, loading, refresh, signOut }),
    [profile, loading, refresh, signOut]
  );

  return (
    <ClinicSessionContext.Provider value={value}>
      {children}
    </ClinicSessionContext.Provider>
  );
}

export function useClinicSession() {
  const ctx = useContext(ClinicSessionContext);
  if (!ctx) {
    throw new Error("useClinicSession must be used within ClinicSessionProvider");
  }
  return ctx;
}
