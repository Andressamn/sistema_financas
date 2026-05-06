import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('auth.errorLogin'));
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
          {t('auth.welcomeBack')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('auth.welcomeBackSub')}</p>

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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder={t('auth.passwordPh')}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            {t('auth.createNow')}
          </Link>
        </p>
      </div>
    </div>
  );
}
