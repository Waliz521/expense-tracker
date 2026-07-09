import {
  Banknote,
  Car,
  CreditCard,
  Dumbbell,
  Film,
  Fuel,
  Gift,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  MoreHorizontal,
  ParkingCircle,
  PiggyBank,
  Plane,
  Receipt,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Wine,
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
  Wine,
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
  Receipt,
  Banknote,
  HeartHandshake,
  Gift,
  TrendingUp,
  PiggyBank,
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
