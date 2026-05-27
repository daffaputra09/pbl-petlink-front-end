"use client";

import { Users, UserCheck, Coffee, Stethoscope } from "lucide-react";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

interface DoctorStatCardsProps {
  total: number;
  bertugas: number;
  cuti: number;
  operasi: number;
}

export default function DoctorStatCard({
  total,
  bertugas,
  cuti,
  operasi,
}: DoctorStatCardsProps) {
  const stats: StatCard[] = [
    {
      label: "Total Dokter",
      value: total,
      icon: <Users size={24} />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Bertugas",
      value: bertugas,
      icon: <UserCheck size={24} />,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-500",
    },
    {
      label: "Cuti",
      value: cuti,
      icon: <Coffee size={24} />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "Operasi",
      value: String(operasi).padStart(2, "0"),
      icon: <Stethoscope size={24} />,
      iconBg: "bg-red-50",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
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