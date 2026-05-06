import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('errors.internal'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-emerald-50 to-emerald-100
      dark:from-gray-900 dark:to-emerald-950">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="card w-full max-w-md p-8 animate-pop">
        <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
          {t('auth.resetTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('auth.resetSubtitle')}</p>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm">
              {t('auth.resetSent')}
            </div>
            <Link to="/login" className="btn-primary w-full py-2.5 inline-flex items-center justify-center">
              {t('auth.backToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder={t('auth.emailPh')}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>

            <Link
              to="/login"
              className="block text-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
            >
              {t('auth.backToLogin')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
