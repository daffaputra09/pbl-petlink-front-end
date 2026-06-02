import {
  bankCodeFor,
  type ClinicDayHours,
  type ClinicRegisterDraft,
  type RegisterAccountDraft,
} from "./register-draft-types";

export type {
  RegisterAccountDraft,
  ClinicDayHours,
  ClinicRegisterDraft,
} from "./register-draft-types";

export { bankCodeFor };

export function defaultOperatingHours(): ClinicDayHours[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i + 1,
    isClosed: i + 1 === 7,
    openTime: "08:00",
    closeTime: "17:00",
  }));
}

export function operatingHoursToRpcPayload(days: ClinicDayHours[]) {
  return days.map((day) => ({
    day_of_week: day.dayOfWeek,
    is_closed: day.isClosed,
    periods: day.isClosed
      ? []
      : [
          {
            opens_at: `${day.openTime}:00`,
            closes_at: `${day.closeTime}:00`,
          },
        ],
  }));
}

export function validateOperatingHours(days: ClinicDayHours[]): string | null {
  for (const day of days) {
    if (day.isClosed) continue;
    const [oh, om] = day.openTime.split(":").map(Number);
    const [ch, cm] = day.closeTime.split(":").map(Number);
    const openM = oh * 60 + om;
    const closeM = ch * 60 + cm;
    if (openM >= closeM) {
      return `Jam tutup harus setelah jam buka (hari ${day.dayOfWeek}).`;
    }
  }
  if (days.every((d) => d.isClosed)) {
    return "Pilih minimal satu hari operasional.";
  }
  return null;
}

export function validateAccountStep(
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  const normalized = email.trim();
  if (!normalized) return "Email wajib diisi.";
  if (!normalized.includes("@") || !normalized.includes(".")) {
    return "Format email tidak valid.";
  }
  if (password.length < 6) return "Kata sandi minimal 6 karakter.";
  if (password !== confirmPassword) return "Konfirmasi kata sandi tidak cocok.";
  return null;
}

const REGISTER_STORAGE_KEY = "petlink_clinic_register_draft";
const PHOTO_DB_NAME = "petlink_register_photo";
const PHOTO_STORE = "photos";

interface StoredDraft {
  account?: RegisterAccountDraft;
  clinicName?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: ClinicDayHours[];
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  photoPreview?: string | null;
}

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PHOTO_DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE);
      }
    };
  });
}

export async function saveRegisterPhoto(file: File): Promise<void> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).put(file, "clinic");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadRegisterPhoto(): Promise<File | null> {
  try {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readonly");
      const req = tx.objectStore(PHOTO_STORE).get("clinic");
      req.onsuccess = () => resolve((req.result as File) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearRegisterPhoto(): Promise<void> {
  try {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).delete("clinic");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export function saveRegisterDraft(draft: Partial<ClinicRegisterDraft & StoredDraft>) {
  if (typeof window === "undefined") return;
  const existing = loadRegisterDraft();
  const rest = { ...draft };
  delete (rest as Partial<ClinicRegisterDraft>).photoFile;
  sessionStorage.setItem(
    REGISTER_STORAGE_KEY,
    JSON.stringify({ ...existing, ...rest })
  );
}

export function loadRegisterDraft(): StoredDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(REGISTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearRegisterDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REGISTER_STORAGE_KEY);
  void clearRegisterPhoto();
}
