import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { api } from '../lib/api';

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: Category | null;
}

export default function CategoryModal({ open, onClose, onSaved, category }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setType(category.type === 'income' ? 'income' : 'expense');
      setError('');
    } else if (open && !category) {
      setName('');
      setType('expense');
      setError('');
    }
  }, [open, category]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (category) await api.put(`/categories/${category.id}`, { name, type });
      else await api.post('/categories', { name, type });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? t('category.edit') : t('category.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('category.name')} <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('category.namePh')} className="input-base" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('category.type')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-lg font-medium transition active:scale-95 ${
                type === 'expense'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('transaction.expense')}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-lg font-medium transition active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-2 ring-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('transaction.income')}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
            {saving ? t('common.saving') : category ? t('transaction.update') : t('transaction.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
