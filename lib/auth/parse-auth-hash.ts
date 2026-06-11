export type AuthHashState =
  | { kind: "none" }
  | { kind: "error"; message: string }
  | { kind: "tokens"; hash: string };

function decodeDescription(raw: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/\+/g, " ");
}

export function parseAuthHash(
  hash: string,
  flow: "invite" | "recovery"
): AuthHashState {
  const trimmed = hash.replace(/^#/, "").trim();
  if (!trimmed) return { kind: "none" };

  const params = new URLSearchParams(trimmed);
  const errorCode = params.get("error_code");
  const error = params.get("error");

  if (errorCode === "otp_expired" || error === "access_denied") {
    return {
      kind: "error",
      message:
        flow === "recovery"
          ? "Tautan reset sudah kedaluwarsa atau sudah pernah dipakai. Minta tautan baru dari halaman lupa kata sandi."
          : "Tautan undangan sudah kedaluwarsa atau sudah pernah dipakai. Minta klinik mengirim ulang undangan.",
    };
  }

  const description = decodeDescription(params.get("error_description"));
  if (error || errorCode) {
    return {
      kind: "error",
      message:
        description ??
        (flow === "recovery"
          ? "Tautan reset tidak valid. Minta tautan baru."
          : "Tautan undangan tidak valid. Minta klinik mengirim ulang undangan."),
    };
  }

  if (params.get("access_token") && params.get("refresh_token")) {
    return { kind: "tokens", hash: trimmed };
  }

  return { kind: "none" };
}
