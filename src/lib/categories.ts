/**
 * Expense categories — organized and structured for filtering and reporting.
 * Each category has an id, label, icon name (lucide), and optional group for grouping in UI.
 */
export const EXPENSE_CATEGORIES = [
  // Living & essentials
  { id: 'housing', label: 'Housing & Rent', icon: 'Home', group: 'Living' },
  { id: 'utilities', label: 'Utilities', icon: 'Zap', group: 'Living' },
  { id: 'groceries', label: 'Groceries', icon: 'ShoppingCart', group: 'Living' },
  { id: 'food_dining', label: 'Food & Dining', icon: 'UtensilsCrossed', group: 'Living' },
  // Transport
  { id: 'transport', label: 'Transportation', icon: 'Car', group: 'Transport' },
  { id: 'repairs_maintenance', label: 'Repairs & Maintenance', icon: 'Wrench', group: 'Transport' },
  { id: 'fuel', label: 'Fuel', icon: 'Fuel', group: 'Transport' },
  { id: 'parking', label: 'Parking & Tolls', icon: 'ParkingCircle', group: 'Transport' },
  // Shopping & lifestyle
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', group: 'Lifestyle' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Film', group: 'Lifestyle' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard', group: 'Lifestyle' },
  { id: 'personal_care', label: 'Personal Care', icon: 'Sparkles', group: 'Lifestyle' },
  // Health & family
  { id: 'health', label: 'Health & Medical', icon: 'HeartPulse', group: 'Health' },
  { id: 'gym', label: 'Gym & Fitness', icon: 'Dumbbell', group: 'Health' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', group: 'Health' },
  { id: 'insurance', label: 'Insurance', icon: 'Shield', group: 'Health' },
  // Other
  { id: 'travel', label: 'Travel', icon: 'Plane', group: 'Other' },
  { id: 'tax', label: 'Tax', icon: 'Receipt', group: 'Other' },
  { id: 'debt', label: 'Debt repayment', icon: 'Banknote', group: 'Other' },
  { id: 'donations', label: 'Donations', icon: 'HeartHandshake', group: 'Other' },
  { id: 'gifts_donations', label: 'Gifts', icon: 'Gift', group: 'Other' },
  { id: 'investments', label: 'Investments & Savings', icon: 'TrendingUp', group: 'Other' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', group: 'Other' },
] as const;

export type CategoryId = (typeof EXPENSE_CATEGORIES)[number]['id'];

export const CATEGORY_IDS = EXPENSE_CATEGORIES.map((c) => c.id);

export function getCategoryById(id: string) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export function getCategoriesByGroup(): Record<string, Array<(typeof EXPENSE_CATEGORIES)[number]>> {
  const map: Record<string, Array<(typeof EXPENSE_CATEGORIES)[number]>> = {};
  for (const cat of EXPENSE_CATEGORIES) {
    const g = cat.group;
    if (!map[g]) map[g] = [];
    map[g].push(cat);
  }
  return map;
}

/**
 * Check if a category is savings/investments (should be excluded from expense calculations)
 */
export function isSavingsCategory(categoryId: string): boolean {
  return categoryId === 'investments';
}

/** Categories still counted in totals & breakdown, but omitted from the daily spending bar chart. */
export function isExcludedFromDailySpendingChart(categoryId: string): boolean {
  return categoryId === 'tax' || categoryId === 'debt' || categoryId === 'donations';
}
