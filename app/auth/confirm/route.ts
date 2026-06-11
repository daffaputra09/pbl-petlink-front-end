import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/auth/set-password";

  const safeNext = next.startsWith("/") ? next : "/auth/set-password";

  if (tokenHash && type) {
    const supabase = await createClient();

    // Drop any existing portal session (clinic/admin) before activating invite link.
    await supabase.auth.signOut();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  const fail = new URL(safeNext, origin);
  fail.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(fail);
}
