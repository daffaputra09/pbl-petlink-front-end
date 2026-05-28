import { Message } from "@/types/chat";
import { CheckCheck } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Pilih percakapan untuk memulai</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 flex flex-col gap-3">
      <div className="flex justify-center my-2">
        <span className="bg-gray-200 text-gray-500 text-xs px-4 py-1 rounded-full">TODAY</span>
      </div>

      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.isSent
                ? "bg-[#1E6B4F] text-white rounded-br-sm"
                : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
            }`}
          >
            <p>{msg.content}</p>
            <div className={`flex items-center gap-1 mt-1 ${msg.isSent ? "justify-end" : "justify-start"}`}>
              <span className={`text-[10px] ${msg.isSent ? "text-white/70" : "text-gray-400"}`}>
                {msg.time}
              </span>
              {msg.isSent && <CheckCheck size={12} className="text-white/70" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
