import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'PT-BR' },
  { code: 'pt-PT', flag: '🇵🇹', label: 'PT-PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label={t('language.label')}
        className="appearance-none text-sm pl-7 pr-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-transparent w-12 sm:text-gray-700 sm:dark:text-gray-200 sm:w-auto sm:pl-2 sm:pr-7 cursor-pointer transition hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-gray-700 dark:text-gray-200">
            {l.flag} {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-base sm:hidden">
        {current.flag}
      </span>
    </div>
  );
}
