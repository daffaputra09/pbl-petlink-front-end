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

/** Landing page before OTP verify — matches invite/recovery email templates. */
export function doctorInviteAcceptUrl(): string {
  return `${getSiteUrl()}/auth/accept-invite?type=invite&next=${encodeURIComponent("/auth/set-password")}`;
}

/** Landing page before OTP verify — matches recovery email template. */
export function passwordRecoveryAcceptUrl(): string {
  return `${getSiteUrl()}/auth/accept-invite?type=recovery&next=${encodeURIComponent("/auth/reset-password")}`;
}

/** @deprecated Use passwordRecoveryAcceptUrl() */
export function passwordRecoveryAcceptPath(): string {
  return "/auth/accept-invite?type=recovery&next=/auth/reset-password";
}
