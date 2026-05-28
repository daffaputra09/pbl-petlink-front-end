import {
  Syringe,
  Stethoscope,
  Scissors,
  Smile,
  Microscope,
  BriefcaseMedical,
  CalendarCheck2,
  TrendingUp,
} from "lucide-react";

import { Service, Stat } from "@/types/layanan";

export const defaultServices: Service[] = [
  {
    id: 1,
    name: "Vaksinasi",
    category: "RUTINITAS PERAWATAN",
    categoryColor: "text-emerald-600",
    price: "Rp. 250.000",
    description:
      "Imunisasi standar untuk rabies, distemper, dan parvovirus. Termasuk pemeriksaan fisik singkat.",
    tags: ["Dogs", "Cats"],
    icon: <Syringe className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-50",
  },
  {
    id: 2,
    name: "Operasi",
    category: "SPESIALISASI",
    categoryColor: "text-red-500",
    price: "Rp. 500.000",
    description:
      "Layanan bedah komprehensif termasuk sterilisasi/kastrasi, perbaikan jaringan lunak, dan prosedur darurat.",
    tags: [],
    icon: <Stethoscope className="w-5 h-5 text-red-500" />,
    iconBg: "bg-red-50",
  },
  {
    id: 3,
    name: "Grooming",
    category: "KESEHATAN",
    categoryColor: "text-orange-500",
    price: "Rp. 150.000",
    description:
      "Perawatan spa lengkap termasuk mandi, pemangkasan rambut, pemotongan kuku, dan lainnya.",
    tags: ["Popular"],
    isPopular: true,
    icon: <Scissors className="w-5 h-5 text-orange-500" />,
    iconBg: "bg-orange-50",
  },
  {
    id: 4,
    name: "Dental Care",
    category: "KEBERSIHAN",
    categoryColor: "text-blue-500",
    price: "Rp. 350.000",
    description:
      "Pembersihan karang gigi dan pemolesan profesional, pemeriksaan kesehatan mulut, dan pencabutan gigi.",
    tags: [],
    icon: <Smile className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-50",
  },
  {
    id: 5,
    name: "Diagnostics",
    category: "LABORATORIUM",
    categoryColor: "text-purple-500",
    price: "Rp. 750.000",
    description:
      "Pemeriksaan darah di tempat, analisis urin, dan evaluasi mikroskopis untuk penyampaian hasil yang cepat.",
    tags: [],
    icon: <Microscope className="w-5 h-5 text-purple-500" />,
    iconBg: "bg-purple-50",
  },
];

export const stats: Stat[] = [
  {
    label: "TOTAL LAYANAN",
    value: "24",
    badge: "+2 bulan",
    badgeColor: "text-emerald-600 bg-emerald-50",
    icon: <BriefcaseMedical className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-50",
  },
  {
    label: "BOOKING AKTIF",
    value: "148",
    badge: "Trend Tertinggi",
    badgeColor: "text-white bg-emerald-500",
    icon: <CalendarCheck2 className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    label: "LAYANAN POPULER",
    value: "Vaksinasi",
    badge: "Trending",
    badgeColor: "text-orange-600 bg-orange-50",
    isLarge: true,
    icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
    iconBg: "bg-orange-50",
  },
];