import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { api } from '../lib/api';
import { API_URL } from '../lib/config';

const API_BASE = API_URL;

interface Category {
  id: number;
  name: string;
  type: string;
}

export interface Transaction {
  id: number;
  amount: string | number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  categoryId?: number | null;
  category?: { id: number; name: string } | null;
  receiptUrl?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction?: Transaction | null;
}

export default function TransactionModal({ open, onClose, onSaved, transaction }: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [existingReceipt, setExistingReceipt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      api.get<Category[]>('/categories').then((res) => setCategories(res.data)).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description ?? '');
      setDate(new Date(transaction.date).toISOString().substring(0, 10));
      const catId = transaction.categoryId ?? transaction.category?.id ?? null;
      setCategoryId(catId ? String(catId) : '');
      setExistingReceipt(transaction.receiptUrl ?? null);
      setReceiptFile(null);
      setError('');
    } else if (open && !transaction) {
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().substring(0, 10));
      setCategoryId('');
      setExistingReceipt(null);
      setReceiptFile(null);
      setError('');
    }
  }, [open, transaction]);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      amount: Number(amount),
      type,
      description: description || null,
      date,
      categoryId: categoryId ? Number(categoryId) : null,
    };
    try {
      const txRes = transaction
        ? await api.put(`/transactions/${transaction.id}`, payload)
        : await api.post('/transactions', payload);

      const savedId = txRes.data.id ?? transaction?.id;

      if (receiptFile && savedId) {
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        await api.post(`/transactions/${savedId}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.message ?? t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveReceipt() {
    if (!transaction) return;
    try {
      await api.delete(`/transactions/${transaction.id}/receipt`);
      setExistingReceipt(null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={transaction ? t('transaction.edit') : t('transaction.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('transaction.amount')} <span className="text-red-500">*</span>
          </label>
          <input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="input-base" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('transaction.description')}</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('transaction.descriptionPh')} className="input-base" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('transaction.date')} <span className="text-red-500">*</span>
            </label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-base" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('transaction.category')}</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-base">
              <option value="">{t('transaction.noCategory')}</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comprovante */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            📎 {t('transaction.receipt')}
          </label>

          {existingReceipt && !receiptFile && (
            <div className="mb-2 flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm">
              <a
                href={`${API_BASE}${existingReceipt}`}
                target="_blank"
                rel="noopener"
                className="text-emerald-700 dark:text-emerald-300 hover:underline truncate"
              >
                {t('transaction.viewExistingReceipt')}
              </a>
              <button
                type="button"
                onClick={handleRemoveReceipt}
                className="text-red-600 dark:text-red-400 text-xs hover:underline ml-2"
              >
                {t('common.delete')}
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 dark:text-gray-300
              file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-emerald-50 file:text-emerald-700
              dark:file:bg-emerald-900/30 dark:file:text-emerald-300
              hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/40
              file:transition file:cursor-pointer"
          />

          {receiptFile && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
            </p>
          )}

          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs text-emerald-800 dark:text-emerald-200">
            <p className="font-semibold mb-1">{t('receipt.tipsTitle')}</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>{t('receipt.tipLight')}</li>
              <li>{t('receipt.tipFraming')}</li>
              <li>{t('receipt.tipFocus')}</li>
              <li>{t('receipt.tipAngle')}</li>
              <li>{t('receipt.tipFormats')}</li>
            </ul>
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
            {saving ? t('common.saving') : transaction ? t('transaction.update') : t('transaction.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
