import { Conversation } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const unread = conversation.unreadCount ?? 0;
  const hasUnread = unread > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive ? "bg-[#E8F5EE] border-r-4 border-[#1E6B4F]" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative shrink-0">
        {conversation.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="rounded-full object-cover w-11 h-11"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#C8E6D4] flex items-center justify-center text-[#1E6B4F] font-semibold text-sm">
            {conversation.initials}
          </div>
        )}
        {conversation.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span
            className={`text-sm truncate ${
              hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-900"
            }`}
          >
            {conversation.name}
          </span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{conversation.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <p
            className={`text-xs truncate flex-1 ${
              hasUnread ? "font-semibold text-gray-700" : "text-gray-500"
            }`}
          >
            {conversation.lastMessage}
          </p>
          {hasUnread && (
            <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#1E6B4F] text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
