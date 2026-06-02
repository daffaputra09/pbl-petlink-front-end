import { createClient } from "@/lib/supabase/client";
import {
  bankCodeFor,
  operatingHoursToRpcPayload,
  type ClinicRegisterDraft,
  validateOperatingHours,
} from "./register-draft";

export async function registerClinic(draft: ClinicRegisterDraft): Promise<void> {
  const hoursError = validateOperatingHours(draft.operatingHours);
  if (hoursError) throw new Error(hoursError);

  const supabase = createClient();
  const email = draft.account.email.trim();
  const password = draft.account.password;

  let userId: string;

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: draft.clinicName.trim(),
        phone: draft.account.phone.trim(),
        role: "clinic",
      },
    },
  });

  if (signUp.error) throw signUp.error;
  if (signUp.data.user) {
    userId = signUp.data.user.id;
    if (!signUp.data.session) {
      const signIn = await supabase.auth.signInWithPassword({ email, password });
      if (signIn.error) throw signIn.error;
      if (!signIn.data.user) throw new Error("Gagal masuk setelah registrasi.");
      userId = signIn.data.user.id;
    }
  } else {
    throw new Error("Registrasi gagal. Coba lagi.");
  }

  let imageUrl: string | null = null;
  if (draft.photoFile) {
    const ext = draft.photoFile.name.split(".").pop() ?? "jpg";
    const path = `${userId}/profile.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("petlink_bucket")
      .upload(path, draft.photoFile, { upsert: true });
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("petlink_bucket")
        .getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    name: draft.clinicName.trim(),
    role: "clinic",
    image_url: imageUrl,
    is_active: true,
  });
  if (profileError) throw profileError;

  const { error: clinicError } = await supabase.from("clinic_profiles").upsert({
    id: userId,
    description: draft.description.trim(),
    address: draft.address.trim(),
    latitude: draft.latitude,
    longitude: draft.longitude,
    is_verified: true,
    bank_name: draft.bankName,
    account_name: draft.accountName.trim(),
    account_number: draft.accountNumber.trim(),
    bank_code: bankCodeFor(draft.bankName),
  });
  if (clinicError) throw clinicError;

  const { error: hoursRpcError } = await supabase.rpc(
    "replace_clinic_opening_hours",
    {
      p_clinic_id: userId,
      p_days: operatingHoursToRpcPayload(draft.operatingHours),
    }
  );
  if (hoursRpcError) throw hoursRpcError;

  await supabase.auth.signOut();
}
