export interface RegisterAccountDraft {
  email: string;
  password: string;
  phone: string;
}

export interface ClinicDayHours {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

export interface ClinicRegisterDraft {
  account: RegisterAccountDraft;
  clinicName: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: ClinicDayHours[];
  bankName: string;
  accountName: string;
  accountNumber: string;
  photoFile?: File | null;
}

export const BANK_CODES: Record<string, string> = {
  BCA: "014",
  BRI: "002",
  BNI: "009",
  Mandiri: "008",
  "CIMB Niaga": "022",
  "Permata Bank": "013",
};

export function bankCodeFor(name: string): string | undefined {
  return BANK_CODES[name];
}
