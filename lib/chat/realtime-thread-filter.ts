import type { SupabaseClient } from "@supabase/supabase-js";

/** Max thread IDs per Realtime `in` filter (keep URL/filter size reasonable). */
const REALTIME_THREAD_FILTER_CHUNK = 80;

export function chunkThreadIds(threadIds: string[]): string[][] {
  if (threadIds.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < threadIds.length; i += REALTIME_THREAD_FILTER_CHUNK) {
    chunks.push(threadIds.slice(i, i + REALTIME_THREAD_FILTER_CHUNK));
  }
  return chunks;
}

/** Supabase Realtime filter: thread_id=in.(uuid1,uuid2,...) */
export function realtimeThreadInFilter(threadIds: string[]): string | null {
  if (threadIds.length === 0) return null;
  return `thread_id=in.(${threadIds.join(",")})`;
}

export async function fetchParticipantThreadIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("chat_threads")
    .select("id")
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`);

  return (data ?? []).map((row) => row.id as string);
}

type RealtimeMessageHandler = (payload: { new: Record<string, unknown> }) => void;

/** Subscribe to chat_messages INSERT only for the user's threads (chunked `in` filters). */
export function subscribeParticipantMessageInserts(
  supabase: SupabaseClient,
  channelName: string,
  threadIds: string[],
  onInsert: RealtimeMessageHandler
) {
  if (threadIds.length === 0) return null;

  const channel = supabase.channel(channelName);
  for (const chunk of chunkThreadIds(threadIds)) {
    const filter = realtimeThreadInFilter(chunk);
    if (!filter) continue;
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter,
      },
      onInsert
    );
  }
  channel.subscribe();
  return channel;
}

/** INSERT + UPDATE on chat_messages for thread list sync. */
export function subscribeParticipantMessageChanges(
  supabase: SupabaseClient,
  channelName: string,
  threadIds: string[],
  handlers: {
    onInsert: RealtimeMessageHandler;
    onUpdate: RealtimeMessageHandler;
  }
) {
  if (threadIds.length === 0) return null;

  const channel = supabase.channel(channelName);
  for (const chunk of chunkThreadIds(threadIds)) {
    const filter = realtimeThreadInFilter(chunk);
    if (!filter) continue;
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter,
      },
      handlers.onInsert
    );
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_messages",
        filter,
      },
      handlers.onUpdate
    );
  }
  channel.subscribe();
  return channel;
}
