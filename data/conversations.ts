import { Conversation } from "@/types/chat";

export const customerConversations: Conversation[] = [
  {
    id: "c1",
    name: "Daffa Putra",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Baik, setelah ini saya update terus...",
    time: "11:20 AM",
    isOnline: true,
    messages: [
      {
        id: "m1",
        content:
          "Saya ingin menanyakan kabar Chiko. Dia tampak agak lesu hari ini setelah pembersihan gigi kemarin. Apakah itu normal?",
        time: "11.10",
        isSent: false,
      },
      {
        id: "m2",
        content:
          "Halo Daffa Putra! Ya, sedikit lesu wajar terjadi selama 24-48 jam pertama karena anestesi belum sepenuhnya hilang dari tubuhnya. Apakah dia sudah makan atau minum?",
        time: "11.11 AM",
        isSent: true,
      },
      {
        id: "m3",
        content: "Baik, setelah ini saya update terus keadaan chiko lewat chat ini",
        time: "11.20",
        isSent: false,
      },
    ],
  },
  {
    id: "c2",
    name: "Nayla Annora",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Apakah pola makan Medita setelah....",
    time: "12:45 PM",
    messages: [],
  },
  {
    id: "c3",
    name: "Atiqah Fathin",
    avatar: "https://i.pravatar.cc/150?img=32",
    lastMessage: "Apa klinik buka besok jam 8 pagi?",
    time: "Yesterday",
    messages: [],
  },
  {
    id: "c4",
    name: "John Doe",
    initials: "JD",
    lastMessage: "Baik, terima kasih",
    time: "Tue",
    messages: [],
  },
];

export const doctorConversations: Conversation[] = [
  {
    id: "d1",
    name: "Drh. Tirta Wahyudi",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Baik Dok, segera kami siapkan label...",
    time: "14.34 PM",
    isOnline: true,
    messages: [
      {
        id: "dm1",
        content:
          "Dok, pemilik 'Bella' ingin tebus resep vitamin saraf untuk 1 bulan. Stok di apotek tinggal sedikit, apakah boleh diganti dengan merk lain?",
        time: "14.33 PM",
        isSent: true,
      },
      {
        id: "dm2",
        content:
          "Boleh, dosisnya disamakan saja. Tolong buatkan labelnya, nanti saya tanda tangan.",
        time: "14.34",
        isSent: false,
      },
      {
        id: "dm3",
        content:
          "Baik Dok, segera kami siapkan labelnya untuk diletakkan di meja Dokter. Terima kasih.",
        time: "14.34 PM",
        isSent: true,
      },
    ],
  },
  {
    id: "d2",
    name: "Drh. Anisa Putri",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Apakah saya ada jadwal operasi....",
    time: "14.45 PM",
    messages: [],
  },
  {
    id: "d3",
    name: "Drh. Dina Safira",
    avatar: "https://i.pravatar.cc/150?img=32",
    lastMessage: "Terima Kasih Update nya",
    time: "Yesterday",
    messages: [],
  },
  {
    id: "d4",
    name: "Drh. Burhan Dwi",
    initials: "BD",
    lastMessage: "FotoTerakhirBunny.jpg",
    time: "Tue",
    messages: [],
  },
];
