"use client";

import { useState } from "react";
import ConversationItem from "@/components/chat/ConversationItem";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { customerConversations, doctorConversations } from "@/data/conversations";
import { Conversation, TabType } from "@/types/chat";

export default function PesanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Customers");
  const [selectedId, setSelectedId] = useState<string>("c1");
  const [conversations, setConversations] = useState({
    Customers: customerConversations,
    Doctors: doctorConversations,
  });
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const currentList = conversations[activeTab];
  const filteredList = currentList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConversation: Conversation | undefined = currentList.find(
    (c) => c.id === selectedId
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedId(tab === "Customers" ? "c1" : "d1");
  };

  const handleSend = (text: string) => {
    if (!selectedId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: `msg-${Date.now()}`,
      content: text,
      time: timeStr,
      isSent: true,
    };

    setConversations((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((conv) =>
        conv.id === selectedId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: text.length > 35 ? text.slice(0, 35) + "..." : text,
              time: timeStr,
            }
          : conv
      ),
    }));
  };

  return (
    <div className="flex flex-col h-full min-w-0 bg-white font-sans">
      {/* Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Conversation List Panel */}
        <div className="w-[300px] border-r border-gray-100 flex flex-col shrink-0">
          <div className="px-3 pt-4 pb-2">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {(["Customers", "Doctors"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white text-[#1E6B4F] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredList.length > 0 ? (
              filteredList.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === selectedId}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))
            ) : (
              <p className="text-center text-sm text-gray-400 py-8">
                Tidak ada percakapan ditemukan
              </p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow messages={selectedConversation?.messages ?? []} />
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}