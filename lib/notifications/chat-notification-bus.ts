const CHANNEL_NAME = "petlink-chat-notifications";
const CLAIM_PREFIX = "petlink-notif-claim-";
const CLAIM_TTL_MS = 60_000;

export type ChatNotificationBusEvent =
  | { type: "claimed"; messageId: string }
  | { type: "unread-delta"; delta: number }
  | { type: "unread-sync"; count: number };

type BusListener = (event: ChatNotificationBusEvent) => void;

let channel: BroadcastChannel | null = null;
const remoteClaimedIds = new Set<string>();
const listeners = new Set<BusListener>();

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<ChatNotificationBusEvent>) => {
      const data = event.data;
      if (data.type === "claimed") {
        remoteClaimedIds.add(data.messageId);
      }
      listeners.forEach((listener) => listener(data));
    };
  }
  return channel;
}

export function subscribeChatNotificationBus(listener: BusListener) {
  getChannel();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishChatNotificationBus(event: ChatNotificationBusEvent) {
  getChannel()?.postMessage(event);
}

function cleanupStaleClaims() {
  if (typeof localStorage === "undefined") return;
  const now = Date.now();
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CLAIM_PREFIX)) continue;
    const ts = Number(localStorage.getItem(key));
    if (!ts || now - ts > CLAIM_TTL_MS) {
      localStorage.removeItem(key);
    }
  }
}

/** Satu tab menangani notifikasi per messageId (anti-duplikat antar-tab). */
export function claimMessageNotification(messageId: string): boolean {
  if (remoteClaimedIds.has(messageId)) return false;

  cleanupStaleClaims();
  const key = `${CLAIM_PREFIX}${messageId}`;
  if (typeof localStorage !== "undefined" && localStorage.getItem(key)) {
    remoteClaimedIds.add(messageId);
    return false;
  }

  localStorage?.setItem(key, String(Date.now()));
  remoteClaimedIds.add(messageId);
  publishChatNotificationBus({ type: "claimed", messageId });
  return true;
}

export function tabShouldPresentInAppToast(): boolean {
  return (
    typeof document !== "undefined" &&
    document.visibilityState === "visible" &&
    document.hasFocus()
  );
}

export function tabShouldPresentOsNotification(): boolean {
  return typeof document !== "undefined" && document.hidden;
}
