const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizeDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidEmail(email: string): boolean {
  const normalized = email.trim();
  if (!normalized || normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
}

export function validateEmail(email: string): string | null {
  const normalized = email.trim();
  if (!normalized) return "Email wajib diisi.";
  if (!isValidEmail(normalized)) return "Format email tidak valid.";
  return null;
}

export function validatePhone(phone: string): string | null {
  const digits = sanitizeDigitsOnly(phone);
  if (!digits) return null;
  if (digits.length < 10) return "Nomor telepon minimal 10 digit.";
  if (digits.length > 15) return "Nomor telepon maksimal 15 digit.";
  return null;
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): string | null {
  if (!currentPassword) return "Kata sandi saat ini wajib diisi.";
  if (newPassword.length < 6) return "Kata sandi baru minimal 6 karakter.";
  if (newPassword !== confirmPassword) {
    return "Konfirmasi kata sandi baru tidak cocok.";
  }
  if (currentPassword === newPassword) {
    return "Kata sandi baru harus berbeda dari kata sandi saat ini.";
  }
  return null;
}

export function validateNewPasswordPair(
  password: string,
  confirmPassword: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (password.length < 6) {
    errors.password = "Kata sandi minimal 6 karakter.";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
  }
  return errors;
}

export function validateAccountStepFull(
  email: string,
  password: string,
  confirmPassword: string,
  phone: string
): string | null {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;

  const phoneErr = validatePhone(phone);
  if (phoneErr) return phoneErr;

  if (password.length < 6) return "Kata sandi minimal 6 karakter.";
  if (password !== confirmPassword) return "Konfirmasi kata sandi tidak cocok.";
  return null;
}
