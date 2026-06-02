"use client";

import { useState } from "react";
import ConversationItem from "@/components/chat/ConversationItem";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { TabType } from "@/types/chat";
import { useClinicChat } from "@/hooks/use-clinic-chat";

export default function PesanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Customers");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const {
    conversations,
    messages,
    selectedId,
    setSelectedId,
    loading,
    sendMessage,
  } = useClinicChat();

  const currentList = conversations[activeTab];
  const filteredList = currentList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConversation = currentList.find((c) => c.id === selectedId);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const first = conversations[tab][0];
    setSelectedId(first?.id ?? null);
  };

  const handleSend = (text: string) => {
    void sendMessage(text);
  };

  return (
    <div
      className={`flex h-[calc(100vh-56px)] ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div
        className={`w-80 border-r flex flex-col ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Pesan</h2>
          <div className="flex gap-2 mt-3">
            {(["Customers", "Doctors"] as TabType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeTab === tab
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab === "Customers" ? "Pelanggan" : "Dokter"}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="p-4 text-sm text-gray-400">Memuat percakapan...</p>
          )}
          {filteredList.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === selectedId}
              onClick={() => setSelectedId(conv.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                darkMode ? "border-gray-700 bg-gray-800" : "bg-white border-gray-200"
              }`}
            >
              <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                {selectedConversation.name}
              </p>
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className="text-xs text-gray-500"
              >
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>
            <ChatWindow messages={messages} />
            <ChatInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Pilih percakapan
          </div>
        )}
      </div>
    </div>
  );
}
