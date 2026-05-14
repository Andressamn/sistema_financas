import { useTranslation } from 'react-i18next';
import { Briefcase, Pencil, Trash2, AlertOctagon, AlertTriangle } from 'lucide-react';
import type { Budget } from './BudgetModal';
import type { Transaction } from './TransactionModal';

interface Props {
  budgets: (Budget & { category: { id: number; name: string } })[];
  transactions: Transaction[];
  formatMoney: (n: number) => string;
  onNew: () => void;
  onEdit: (b: Budget) => void;
  onDelete: (b: Budget) => void;
}

export default function BudgetSection({ budgets, transactions, formatMoney, onNew, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  // soma despesas por categoria no mês
  const spentByCategory = transactions
    .filter((tx) => tx.type === 'expense' && tx.category)
    .reduce<Record<number, number>>((acc, tx) => {
      const id = tx.category!.id;
      acc[id] = (acc[id] ?? 0) + Number(tx.amount);
      return acc;
    }, {});

  return (
    <section className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Briefcase size={20} className="text-emerald-600 dark:text-emerald-400" />
          {t('budget.title')}
        </h2>
        <button
          onClick={onNew}
          className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline transition active:scale-95"
        >
          {t('dashboard.newShort')}
        </button>
      </div>

      {budgets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('budget.empty')}</p>
      ) : (
        <ul className="space-y-4">
          {budgets.map((b) => {
            const limit = Number(b.amount);
            const spent = spentByCategory[b.category.id] ?? 0;
            const percent = limit > 0 ? (spent / limit) * 100 : 0;
            const isCritical = percent >= 100;
            const isWarning = percent >= 80 && percent < 100;
            const barColor = isCritical
              ? 'bg-red-500'
              : isWarning
              ? 'bg-yellow-500'
              : 'bg-emerald-500';

            return (
              <li key={b.id} className="group">
                <div className="flex justify-between mb-1 items-center">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{b.category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMoney(spent)} / {formatMoney(limit)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEdit(b)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-90 text-gray-600 dark:text-gray-300"
                        aria-label={t('common.edit')}
                        title={t('common.edit')}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(b)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90 text-red-500 dark:text-red-400"
                        aria-label={t('common.delete')}
                        title={t('common.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                {isCritical && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium flex items-center gap-1.5">
                    <AlertOctagon size={14} />
                    {t('budget.alertExceeded', { name: b.category.name })}
                  </p>
                )}
                {isWarning && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 font-medium flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    {t('budget.alertWarning', { name: b.category.name, percent: percent.toFixed(0) })}
                  </p>
                )}
                {!isCritical && !isWarning && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('budget.percentUsed', { percent: percent.toFixed(0) })}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
