import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin" && profile.is_active !== false) {
      redirect("/admin/dashboard");
    }
    if (profile?.role === "clinic" && profile.is_active !== false) {
      redirect("/klinik/dashboard");
    }
  }

  return <LandingPage />;
}
