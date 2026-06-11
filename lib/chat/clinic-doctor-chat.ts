import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/types/chat";
import type { Doctor } from "@/types/dokter";

export type DoctorChatEntry = {
  doctorId: string;
  name: string;
  avatar?: string;
  initials: string;
  specialization?: string;
  status?: string;
  threadId: string | null;
  lastMessage: string;
  time: string;
  lastMessageAt?: string | null;
  unreadCount: number;
  hasThread: boolean;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function mergeDoctorDirectory(
  doctors: Doctor[],
  threads: Conversation[]
): DoctorChatEntry[] {
  const threadByDoctorId = new Map<string, Conversation>();
  for (const thread of threads) {
    if (thread.peerId) {
      threadByDoctorId.set(thread.peerId, thread);
    }
  }

  const entries = doctors.map((doctor) => {
    const thread = threadByDoctorId.get(doctor.id);
    if (thread) {
      return {
        doctorId: doctor.id,
        name: thread.name,
        avatar: thread.avatar,
        initials: thread.initials ?? initialsFromName(thread.name),
        specialization: doctor.spesialisasi,
        status: doctor.status,
        threadId: thread.id,
        lastMessage: thread.lastMessage || "Belum ada pesan",
        time: thread.time,
        lastMessageAt: thread.lastMessageAt,
        unreadCount: thread.unreadCount ?? 0,
        hasThread: true,
      };
    }

    return {
      doctorId: doctor.id,
      name: doctor.nama,
      avatar: doctor.photo,
      initials: initialsFromName(doctor.nama),
      specialization: doctor.spesialisasi,
      status: doctor.status,
      threadId: null,
      lastMessage: "Belum ada pesan — tap untuk mulai chat",
      time: "",
      lastMessageAt: null,
      unreadCount: 0,
      hasThread: false,
    };
  });

  return entries.sort((a, b) => {
    const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    if (at !== bt) return bt - at;
    return a.name.localeCompare(b.name, "id");
  });
}

export async function findOrCreateClinicDoctorThread(
  clinicId: string,
  doctorId: string
): Promise<string> {
  const supabase = createClient();

  const { data: existing, error: findError } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("type", "chat")
    .or(
      `and(user_1_id.eq.${clinicId},user_2_id.eq.${doctorId}),` +
        `and(user_1_id.eq.${doctorId},user_2_id.eq.${clinicId})`
    )
    .maybeSingle();

  if (findError) throw findError;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from("chat_threads")
    .insert({
      user_1_id: clinicId,
      user_2_id: doctorId,
      type: "chat",
      is_active: true,
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}
