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
  // Invite links use implicit flow (#access_token in hash). Must land directly on
  // the client page — /auth/callback is server-side and cannot read the hash.
  return `${getSiteUrl()}/auth/set-password`;
}

export function passwordResetRedirectUrl(): string {
  return `${getSiteUrl()}/auth/reset-password`;
}
