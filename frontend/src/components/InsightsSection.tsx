import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, TrendingUp, TrendingDown, Sparkles, PiggyBank, type LucideIcon } from 'lucide-react';
import { api } from '../lib/api';
import type { Transaction } from './TransactionModal';

interface Props {
  currentMonth: string; // "YYYY-MM"
  currentTransactions: Transaction[];
  formatMoney: (n: number) => string;
}

interface Insight {
  type: 'increase' | 'decrease' | 'new' | 'savings';
  category: string;
  message: string;
  delta?: number;
}

function previousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const prev = new Date(year, m - 2, 1); // m-1 é o mês atual zero-indexed; m-2 = mês anterior
  return prev.toISOString().substring(0, 7);
}

function monthRange(month: string) {
  const [year, monthNum] = month.split('-').map(Number);
  const from = `${month}-01`;
  const next = new Date(year, monthNum, 1);
  const to = next.toISOString().substring(0, 10);
  return { from, to };
}

export default function InsightsSection({ currentMonth, currentTransactions, formatMoney }: Props) {
  const { t } = useTranslation();
  const [prevTransactions, setPrevTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prev = previousMonth(currentMonth);
    const { from, to } = monthRange(prev);
    setLoading(true);
    api
      .get<Transaction[]>(`/transactions?from=${from}&to=${to}`)
      .then((res) => setPrevTransactions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth]);

  function totalsByCategory(txs: Transaction[]): Record<string, number> {
    return txs
      .filter((tx) => tx.type === 'expense' && tx.category)
      .reduce<Record<string, number>>((acc, tx) => {
        const name = tx.category!.name;
        acc[name] = (acc[name] ?? 0) + Number(tx.amount);
        return acc;
      }, {});
  }

  const currNet =
    currentTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((s, tx) => s + Number(tx.amount), 0) -
    currentTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((s, tx) => s + Number(tx.amount), 0);

  const prevNet =
    prevTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((s, tx) => s + Number(tx.amount), 0) -
    prevTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((s, tx) => s + Number(tx.amount), 0);

  const currCats = totalsByCategory(currentTransactions);
  const prevCats = totalsByCategory(prevTransactions);

  const insights: Insight[] = [];

  // economia/perda do saldo geral
  if (prevTransactions.length > 0) {
    const diff = currNet - prevNet;
    if (currNet > prevNet && Math.abs(diff) > 1) {
      insights.push({
        type: 'savings',
        category: 'geral',
        message: t('insights.savedMore', { amount: formatMoney(Math.abs(diff)) }),
      });
    }
  }

  // mudanças por categoria
  for (const [name, curr] of Object.entries(currCats)) {
    const prev = prevCats[name];
    if (prev === undefined) {
      insights.push({
        type: 'new',
        category: name,
        message: t('insights.newCategory', { name, amount: formatMoney(curr) }),
      });
      continue;
    }
    const change = ((curr - prev) / prev) * 100;
    if (Math.abs(change) >= 20 && curr > 1) {
      if (change > 0) {
        insights.push({
          type: 'increase',
          category: name,
          delta: change,
          message: t('insights.spentMore', { name, percent: change.toFixed(0) }),
        });
      } else {
        insights.push({
          type: 'decrease',
          category: name,
          delta: change,
          message: t('insights.spentLess', { name, percent: Math.abs(change).toFixed(0) }),
        });
      }
    }
  }

  // categorias que tinha antes e desapareceram
  for (const name of Object.keys(prevCats)) {
    if (!(name in currCats)) {
      insights.push({
        type: 'savings',
        category: name,
        message: t('insights.noLongerSpending', { name }),
      });
    }
  }

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Lightbulb size={20} className="text-amber-500" />
        {t('insights.title')}
      </h2>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('common.loading')}</p>
      ) : prevTransactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('insights.noPreviousData')}</p>
      ) : insights.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('insights.noChanges')}</p>
      ) : (
        <ul className="space-y-2">
          {insights.map((ins, idx) => {
            const Icon: LucideIcon =
              ins.type === 'increase' ? TrendingUp :
              ins.type === 'decrease' ? TrendingDown :
              ins.type === 'new' ? Sparkles : PiggyBank;
            const color =
              ins.type === 'increase'
                ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : ins.type === 'decrease' || ins.type === 'savings'
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            return (
              <li key={idx} className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${color}`}>
                <Icon size={16} className="mt-0.5 shrink-0" />
                <span>{ins.message}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
