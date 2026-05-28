export type TabType = "Customers" | "Doctors";

export interface Message {
  id: string;
  content: string;
  time: string;
  isSent: boolean; // true = sent by clinic staff (green bubble), false = received
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  lastMessage: string;
  time: string;
  isOnline?: boolean;
  messages: Message[];
}
