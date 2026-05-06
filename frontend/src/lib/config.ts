// Lê a URL da API do .env (Vite injeta variáveis VITE_*)
// Em dev usa fallback localhost. Em produção define VITE_API_URL no Vercel.
export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:3000';
