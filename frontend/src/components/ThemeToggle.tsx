import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="p-2 rounded-lg text-xl transition active:scale-90 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
