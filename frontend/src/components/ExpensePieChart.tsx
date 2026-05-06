import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

// Paleta colorida — categorias precisam ser visualmente distintas
const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#a855f7', // purple
  '#ef4444', // red
  '#0ea5e9', // sky
];

interface Props {
  data: { name: string; value: number }[];
  emptyMessage?: string;
  formatMoney?: (n: number) => string;
}

export default function ExpensePieChart({ data, emptyMessage, formatMoney }: Props) {
  const { theme } = useTheme();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        {emptyMessage ?? '—'}
      </div>
    );
  }

  const fmt = formatMoney ?? ((n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => fmt(value)}
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            color: theme === 'dark' ? '#f3f4f6' : '#111827',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '0.875rem', color: theme === 'dark' ? '#d1d5db' : '#374151' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
