"use client";

import { Users, UserCheck, UserX } from "lucide-react";

interface DoctorStatCardsProps {
  total: number;
  aktif: number;
  nonaktif: number;
}

export default function DoctorStatCards({
  total,
  aktif,
  nonaktif,
}: DoctorStatCardsProps) {
  const stats = [
    {
      label: "Total Dokter",
      value: total,
      icon: <Users size={24} />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Aktif",
      value: aktif,
      icon: <UserCheck size={24} />,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-500",
    },
    {
      label: "Nonaktif",
      value: nonaktif,
      icon: <UserX size={24} />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
        >
          <div className={`${stat.iconBg} ${stat.iconColor} p-3 rounded-xl`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
