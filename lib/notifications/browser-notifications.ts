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

export function navigateToChatThread(threadId: string) {
  const url = `/klinik/pesan?thread=${encodeURIComponent(threadId)}`;
  window.location.assign(url);
}

export function showChatBrowserNotification(options: {
  title: string;
  body: string;
  threadId: string;
  tag?: string;
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
      navigateToChatThread(options.threadId);
      notification.close();
    };
  } catch {
    // Some browsers block notifications outside secure contexts.
  }
}
