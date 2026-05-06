import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { api } from '../lib/api';

interface ExpenseCategory {
  id: number;
  name: string;
  type: string;
}

export interface Budget {
  id: number;
  amount: string | number;
  categoryId: number;
  category?: { id: number; name: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  budget?: Budget | null;
}

export default function BudgetModal({ open, onClose, onSaved, budget }: Props) {
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    api
      .get<ExpenseCategory[]>('/categories')
      .then((res) => setCategories(res.data.filter((c) => c.type === 'expense')))
      .catch(console.error);
  }, [open]);

  useEffect(() => {
    if (open && budget) {
      setCategoryId(String(budget.categoryId));
      setAmount(String(budget.amount));
      setError('');
    } else if (open) {
      setCategoryId('');
      setAmount('');
      setError('');
    }
  }, [open, budget]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (budget) {
        await api.put(`/budgets/${budget.id}`, { amount: Number(amount) });
      } else {
        await api.post('/budgets', { categoryId: Number(categoryId), amount: Number(amount) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={budget ? t('budget.edit') : t('budget.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('budget.category')} <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-base"
            disabled={!!budget}
          >
            <option value="">— {t('budget.chooseCategory')} —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('budget.monthlyLimit')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500,00"
            className="input-base"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('budget.alertHint')}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
            {saving ? t('common.saving') : budget ? t('transaction.update') : t('transaction.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
