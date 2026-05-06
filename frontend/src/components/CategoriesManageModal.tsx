import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { api } from '../lib/api';
import type { Category } from './CategoryModal';

interface Props {
  open: boolean;
  onClose: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  refreshKey?: number;
}

export default function CategoriesManageModal({ open, onClose, onEdit, onDelete, refreshKey }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .get<Category[]>('/categories')
      .then((res) => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, refreshKey]);

  return (
    <Modal open={open} onClose={onClose} title={t('category.manage')}>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-4 text-center">{t('category.noCategories')}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {categories.map((c) => (
            <li key={c.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {c.type === 'income' ? t('transaction.income') : t('transaction.expense')}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(c)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-90"
                  aria-label={t('common.edit')}
                  title={t('common.edit')}
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(c)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90"
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onClose} className="btn-secondary w-full py-2.5 mt-4">
        {t('common.close')}
      </button>
    </Modal>
  );
}
