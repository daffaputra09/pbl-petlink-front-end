import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "petlink_bucket";

function profilePhotoPath(userId: string, file: File): string {
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  return `${userId}/profile.${ext}`;
}

export async function uploadProfilePhoto(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const path = profilePhotoPath(userId, file);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
