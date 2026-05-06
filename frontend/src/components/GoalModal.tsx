import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { api } from '../lib/api';

export interface Goal {
  id: number;
  name: string;
  targetAmount: string | number;
  currentAmount: string | number;
  deadline: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  goal?: Goal | null;
}

export default function GoalModal({ open, onClose, onSaved, goal }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setCurrentAmount(String(goal.currentAmount));
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().substring(0, 10) : '');
      setError('');
    } else if (open && !goal) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
      setError('');
    }
  }, [open, goal]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      deadline: deadline || null,
    };
    try {
      if (goal) await api.put(`/goals/${goal.id}`, payload);
      else await api.post('/goals', payload);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={goal ? t('goal.edit') : t('goal.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('goal.name')} <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('goal.namePh')} className="input-base" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('goal.target')} <span className="text-red-500">*</span>
            </label>
            <input type="number" step="0.01" min="0" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="3000,00" className="input-base" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('goal.saved')}</label>
            <input type="number" step="0.01" min="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0,00" className="input-base" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('goal.deadline')}</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-base" />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
            {saving ? t('common.saving') : goal ? t('transaction.update') : t('transaction.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
