import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt-BR', label: '🇧🇷 PT-BR' },
  { code: 'pt-PT', label: '🇵🇹 PT-PT' },
  { code: 'en', label: '🇺🇸 EN' },
  { code: 'fr', label: '🇫🇷 FR' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label={t('language.label')}
      className="text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer transition hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
