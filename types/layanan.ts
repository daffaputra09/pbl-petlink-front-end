import { ReactNode } from "react";

export interface Service {
  id: string | number;
  name: string;
  category: string;
  categoryColor: string;
  price: string;
  description: string;
  tags: string[];
  isPopular?: boolean;
  icon: ReactNode;
  iconBg: string;
}

export interface Stat {
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
  isLarge?: boolean;
  icon: ReactNode;
  iconBg: string;
}