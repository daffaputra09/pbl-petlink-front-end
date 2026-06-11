/** Base URL of the Next.js app (used for Supabase auth redirect links). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://127.0.0.1:3000";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }

  return `https://${raw.replace(/\/$/, "")}`;
}

export function authCallbackUrl(nextPath: string): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export function doctorSetPasswordRedirectUrl(): string {
  return authCallbackUrl("/auth/set-password");
}

export function passwordResetRedirectUrl(): string {
  return authCallbackUrl("/auth/reset-password");
}
