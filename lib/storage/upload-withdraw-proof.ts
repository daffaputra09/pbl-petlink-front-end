import type { SupabaseClient } from "@supabase/supabase-js";
import {
  compressIfNeeded,
  PROFILE_IMAGE_MAX_BYTES,
  ProfileImageTooLargeError,
} from "@/lib/media/profile-image";

const BUCKET = "petlink_bucket";

function imageExtension(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export { ProfileImageTooLargeError };

export async function uploadWithdrawProof(
  supabase: SupabaseClient,
  adminUserId: string,
  withdrawRequestId: string,
  file: File
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, atau WebP).");
  }

  let uploadFile = file;
  if (file.size >= PROFILE_IMAGE_MAX_BYTES) {
    uploadFile = await compressIfNeeded(file);
  }
  if (uploadFile.size >= PROFILE_IMAGE_MAX_BYTES) {
    throw new ProfileImageTooLargeError();
  }

  const path = `${adminUserId}/withdraw-proofs/${withdrawRequestId}.${imageExtension(uploadFile)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, uploadFile, {
      upsert: true,
      contentType: uploadFile.type || "image/jpeg",
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
