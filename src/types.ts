export type Category = 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Health' | 'Education' | 'Entertainment' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // YYYY-MM-DD
}

export interface CategoryConfig {
  color: string;
  bg: string;
}

export const CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Health',
  'Education',
  'Entertainment',
  'Other'
];

export const CATEGORY_COLORS: Record<Category, CategoryConfig> = {
  Food: { color: 'text-red-400', bg: 'bg-red-400/10' },
  Travel: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
  Bills: { color: 'text-amber-400', bg: 'bg-amber-400/10' },
  Shopping: { color: 'text-purple-400', bg: 'bg-purple-400/10' },
  Health: { color: 'text-green-400', bg: 'bg-green-400/10' },
  Education: { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  Entertainment: { color: 'text-pink-400', bg: 'bg-pink-400/10' },
  Other: { color: 'text-gray-400', bg: 'bg-gray-400/10' },
};
