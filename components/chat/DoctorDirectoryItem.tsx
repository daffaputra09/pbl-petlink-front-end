import type { DoctorChatEntry } from "@/lib/chat/clinic-doctor-chat";

interface DoctorDirectoryItemProps {
  entry: DoctorChatEntry;
  isActive: boolean;
  onClick: () => void;
}

export default function DoctorDirectoryItem({
  entry,
  isActive,
  onClick,
}: DoctorDirectoryItemProps) {
  const unread = entry.unreadCount ?? 0;
  const hasUnread = unread > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive ? "bg-[#E8F5EE] border-r-4 border-[#1E6B4F]" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative shrink-0">
        {entry.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.avatar}
            alt={entry.name}
            className="rounded-full object-cover w-11 h-11"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#C8E6D4] flex items-center justify-center text-[#1E6B4F] font-semibold text-sm">
            {entry.initials}
          </div>
        )}
        {!entry.hasThread && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1E6B4F] text-white text-[10px] font-bold flex items-center justify-center">
            +
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5 gap-2">
          <span
            className={`text-sm truncate ${
              hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-900"
            }`}
          >
            {entry.name}
          </span>
          {entry.time ? (
            <span className="text-xs text-gray-400 shrink-0">{entry.time}</span>
          ) : null}
        </div>
        {entry.specialization ? (
          <p className="text-[11px] text-emerald-700 font-medium truncate mb-0.5">
            {entry.specialization}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <p
            className={`text-xs truncate flex-1 ${
              entry.hasThread
                ? hasUnread
                  ? "font-semibold text-gray-700"
                  : "text-gray-500"
                : "text-gray-400 italic"
            }`}
          >
            {entry.lastMessage}
          </p>
          {hasUnread ? (
            <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#1E6B4F] text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
