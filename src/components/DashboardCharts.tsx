import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { getCategoryById } from '../lib/categories';
import type { CategorySummary, DailyTotal } from '../types/expense';

const CHART_COLORS = [
  '#0d9488', /* teal */
  '#dc2626', /* red */
  '#ea580c', /* orange */
  '#ca8a04', /* amber */
  '#16a34a', /* green */
  '#2563eb', /* blue */
  '#7c3aed', /* violet */
  '#c026d3', /* fuchsia */
  '#db2777', /* pink */
  '#64748b', /* slate */
  '#0891b2', /* cyan */
  '#65a30d', /* lime */
];

interface DashboardChartsProps {
  byCategory: CategorySummary[];
  daily: DailyTotal[];
  total: number;
  formatCurrency: (n: number) => string;
}

export function DashboardCharts({ byCategory, daily, total, formatCurrency }: DashboardChartsProps) {
  const pieData = byCategory.map((c) => ({
    name: getCategoryById(c.categoryId).label,
    value: c.total,
    percentage: c.percentage,
  }));

  const barData = daily.map((d) => ({
    date: d.date,
    label: format(parseISO(d.date), 'MMM d'),
    total: d.total,
    count: d.count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* By category — Pie */}
      <div className="overflow-visible rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-5">
        <h3 className="font-display text-base font-bold text-surface-900 dark:text-white">Spending by category</h3>
        {pieData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-surface-500">No data this month</div>
        ) : (
          <div className="h-64 overflow-visible sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 16, right: 24, left: 24, bottom: 16 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ percentage }) => `${percentage.toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Total']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--surface-200)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Daily trend — Bar */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-5">
        <h3 className="font-display text-base font-bold text-surface-900 dark:text-white">Daily spending</h3>
        {barData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-surface-500">No data this month</div>
        ) : (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-surface-500"
                />
                <YAxis
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-surface-500"
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Spent']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date && format(parseISO(payload[0].payload.date), 'MMM d, yyyy')}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--surface-200)' }}
                />
                <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
