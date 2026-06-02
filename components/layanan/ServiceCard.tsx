"use client";

import Link from "next/link";
import {Trash2,Plus,} from "lucide-react";
import { Service } from "@/types/layanan";

interface ServiceCardProps {
  service: Service;
  onDelete: (id: string | number) => void;
}

function ServiceCard({ service, onDelete }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`${service.iconBg} w-10 h-10 rounded-xl flex items-center justify-center`}
          >
            {service.icon}
          </div>

          <div>
            <h3 className="font-bold text-gray-800 text-base">
              {service.name}
            </h3>

            <span
              className={`text-[11px] font-bold tracking-wider ${service.categoryColor}`}
            >
              {service.category}
            </span>
          </div>
        </div>

        <span className="text-sm font-semibold text-gray-500">
          {service.price}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed flex-1">
        {service.description}
      </p>

      {/* Tags */}
      {service.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                service.isPopular
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Edit
        </button>

        <button
          onClick={() => onDelete(service.id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
          aria-label="Hapus layanan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ServiceCardsProps {
  data: Service[];
  onDelete: (id: string | number) => void;
}

export default function ServiceCards({ data, onDelete }: ServiceCardsProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onDelete={onDelete}
        />
      ))}

      {/* Add Custom Service Card */}
      <Link href="/klinik/layanan/tambah">
        <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 min-h-[220px] cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
          
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </div>

          <span className="text-sm text-gray-400 group-hover:text-emerald-600 font-medium transition-colors">
            Add Custom Service
          </span>
        </div>
      </Link>
    </div>
  );
}