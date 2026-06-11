import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/auth/set-password";

  const safeNext = next.startsWith("/") ? next : "/auth/set-password";
  const successUrl = new URL(safeNext, origin);
  const failUrl = new URL(safeNext, origin);
  failUrl.searchParams.set("error", "invalid_link");

  if (!tokenHash || !type) {
    return NextResponse.redirect(failUrl);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route handler may run in read-only context; redirect still works.
          }
        },
      },
    }
  );

  // Replace any existing portal session before activating recovery/invite link.
  await supabase.auth.signOut();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(failUrl);
  }

  return NextResponse.redirect(successUrl);
}
