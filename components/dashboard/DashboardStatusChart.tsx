"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardStatusSlice } from "@/types/dashboard";
import { KlinikSectionCard } from "@/components/klinik/KlinikPageLayout";

type Props = {
  data: DashboardStatusSlice[];
};

export default function DashboardStatusChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <KlinikSectionCard
      title="Status Booking"
      description={`${total} total booking`}
    >
      <div className="px-5 pb-5 pt-2">
        {total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Belum ada data booking.
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} booking`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {data.map((item) => (
                <div
                  key={item.name}
                  className="inline-flex items-center gap-2 text-xs text-gray-600"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </KlinikSectionCard>
  );
}
