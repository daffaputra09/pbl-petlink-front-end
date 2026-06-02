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

export interface AdminProfile {
  id: string;
  name: string;
  imageUrl: string | null;
  role: "admin";
}

interface AdminSessionContextValue {
  profile: AdminProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(
  null
);

export function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
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

    if (!data || data.role !== "admin" || data.is_active === false) {
      setProfile(null);
    } else {
      setProfile({
        id: data.id,
        name: data.name,
        imageUrl: data.image_url,
        role: "admin",
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
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return ctx;
}
