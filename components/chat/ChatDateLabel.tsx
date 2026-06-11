"use client";

import { formatChatDateLabel } from "@/lib/chat/datetime";

interface ChatDateLabelProps {
  date: string;
}

export default function ChatDateLabel({ date }: ChatDateLabelProps) {
  return (
    <div className="flex justify-center my-3">
      <span className="px-3 py-1 rounded-xl bg-gray-200/80 text-[11px] font-bold text-gray-500">
        {formatChatDateLabel(date)}
      </span>
    </div>
  );
}
