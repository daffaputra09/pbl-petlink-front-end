import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/set-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const safeNext = next.startsWith("/") ? next : "/auth/set-password";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  const fail = new URL("/auth/set-password", origin);
  fail.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(fail);
}
