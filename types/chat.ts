export type TabType = "Customers" | "Doctors";

export type MessageType = "text" | "image";

export interface Message {
  id: string;
  content: string;
  time: string;
  createdAt?: string;
  isSent: boolean;
  isRead?: boolean;
  type?: MessageType;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  lastMessage: string;
  time: string;
  lastMessageAt?: string | null;
  peerId?: string;
  peerRole?: string;
  threadType?: string;
  unreadCount?: number;
  isOnline?: boolean;
  messages: Message[];
}