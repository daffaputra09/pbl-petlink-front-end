import type { TabType } from "@/types/chat";
import { buildPesanUrl } from "@/lib/chat/pesan-url";

export type NotificationPermissionState = NotificationPermission | "unsupported";

export function getNotificationSupport(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (getNotificationSupport() === "unsupported") return "unsupported";
  const result = await Notification.requestPermission();
  return result;
}

export function navigateToChatThread(threadId: string, tab?: TabType) {
  window.location.assign(
    buildPesanUrl({
      threadId,
      tab: tab ?? "Customers",
    })
  );
}

export function showChatBrowserNotification(options: {
  title: string;
  body: string;
  threadId: string;
  tag?: string;
  tab?: TabType;
}) {
  if (getNotificationSupport() !== "granted") return;

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      tag: options.tag ?? `chat-${options.threadId}`,
      icon: "/favicon.ico",
    });

    notification.onclick = () => {
      window.focus();
      navigateToChatThread(options.threadId, options.tab);
      notification.close();
    };
  } catch {
    // Some browsers block notifications outside secure contexts.
  }
}
