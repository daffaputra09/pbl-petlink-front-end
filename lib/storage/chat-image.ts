import { createClient } from "@/lib/supabase/client";
import {
  compressIfNeeded,
  PROFILE_IMAGE_MAX_BYTES,
  ProfileImageTooLargeError,
} from "@/lib/media/profile-image";

export const CHAT_IMAGE_BUCKET = "petlink_bucket";
export const MAX_CHAT_IMAGES_PER_SEND = 5;

export { ProfileImageTooLargeError };

export function lastMessagePreview(
  messageType?: string | null,
  message?: string | null,
  imageCount = 1
): string {
  const text = message?.trim() ?? "";
  if (text) return text;
  if (messageType === "image") {
    return imageCount > 1 ? `${imageCount} foto` : "Foto";
  }
  return text;
}

export async function uploadChatImage(
  userId: string,
  threadId: string,
  file: File,
  index: number
): Promise<string> {
  let uploadFile = file;
  if (file.size >= PROFILE_IMAGE_MAX_BYTES) {
    uploadFile = await compressIfNeeded(file);
  }
  if (uploadFile.size >= PROFILE_IMAGE_MAX_BYTES) {
    throw new ProfileImageTooLargeError();
  }

  const supabase = createClient();
  const path = `${userId}/chat/${threadId}/${Date.now()}_${index}.jpg`;

  const { error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .upload(path, uploadFile, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(CHAT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
