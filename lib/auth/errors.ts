export function messageFromAuthError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: string }).message).toLowerCase();
    if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
      return "Email atau kata sandi salah.";
    }
    if (msg.includes("email not confirmed")) {
      return "Email belum dikonfirmasi. Periksa kotak masuk Anda.";
    }
    if (msg.includes("user already registered")) {
      return "Email sudah terdaftar. Silakan masuk.";
    }
    if (msg.includes("password")) {
      return "Kata sandi tidak memenuhi persyaratan.";
    }
    return (error as { message: string }).message;
  }
  return "Terjadi kesalahan. Silakan coba lagi.";
}
