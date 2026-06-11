/** Parse Supabase auth errors returned in URL hash (#error_code=...). */
export function parseAuthHashError(
  hash: string,
  flow: "invite" | "recovery" = "invite"
): string | null {
  if (!hash || hash === "#") return null;

  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const error = params.get("error");
  const errorCode = params.get("error_code");
  if (!error && !errorCode) return null;

  if (errorCode === "otp_expired" || error === "access_denied") {
    return flow === "recovery"
      ? "Tautan reset sudah kedaluwarsa atau sudah pernah dipakai. Minta tautan baru dari halaman lupa kata sandi."
      : "Tautan undangan sudah kedaluwarsa atau sudah pernah dipakai. Minta klinik mengirim ulang undangan.";
  }

  const description = params.get("error_description")?.replace(/\+/g, " ");
  if (description) return description;

  return flow === "recovery"
    ? "Tautan reset tidak valid. Minta tautan baru."
    : "Tautan undangan tidak valid. Minta klinik mengirim ulang undangan.";
}
