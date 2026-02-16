import {
  Car,
  CreditCard,
  Dumbbell,
  Film,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  ParkingCircle,
  Plane,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Wrench,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CategoryId } from '../lib/categories';

const iconMap: Record<string, LucideIcon> = {
  Home,
  Zap,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Wrench,
  Fuel,
  ParkingCircle,
  ShoppingBag,
  Film,
  CreditCard,
  Sparkles,
  HeartPulse,
  Dumbbell,
  GraduationCap,
  Shield,
  Plane,
  Gift,
  TrendingUp,
  MoreHorizontal,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? MoreHorizontal;
  return <Icon className={className} />;
}

import { getCategoryById } from '../lib/categories';

export function getCategoryIcon(categoryId: CategoryId): LucideIcon {
  const cat = getCategoryById(categoryId);
  return iconMap[cat.icon] ?? MoreHorizontal;
}
