# Sistema de Finanças Pessoais

> Controle suas receitas, despesas, orçamentos e metas em um só lugar — com gráficos, insights mensais e suporte a 4 idiomas.

[![Live Demo](https://img.shields.io/badge/Live_Demo-▶_Acessar-10b981?style=for-the-badge)](https://sistema-financas-psi.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## ✨ Funcionalidades

- 🔐 **Autenticação completa** — cadastro, login e recuperação de senha por email
- 💰 **Transações** — receitas e despesas com categorias, datas e descrições
- 📂 **Categorias customizáveis** — separe seus gastos do jeito que faz sentido pra você
- 🎯 **Metas de economia** — defina objetivos com prazo e acompanhe o progresso
- 💼 **Orçamentos por categoria** — receba alertas ao atingir 80% e 100% do limite mensal
- 📊 **Gráficos interativos** — pizza de despesas por categoria com Recharts
- 💡 **Insights mensais** — comparações automáticas com o mês anterior
- 📎 **Comprovantes** — anexe foto ou PDF a cada transação
- 🌗 **Dark mode** — alternância suave entre claro e escuro
- 🌍 **Multi-idioma** — PT-BR, PT-PT, EN, FR com moeda automática (BRL, EUR, USD)
- 📱 **Responsivo** — funciona bem no celular, tablet e desktop

---

## 🚀 Demo ao vivo

**Acesse:** [sistema-financas-psi.vercel.app](https://sistema-financas-psi.vercel.app)

> ⚠️ O backend roda no plano gratuito do Render — a primeira requisição pode levar ~30s para "acordar" o servidor.

---

## 🛠️ Stack

### Frontend
- **React 18** + **Vite 5** — UI moderna e build rápido
- **TypeScript** — segurança de tipos em todo o código
- **Tailwind CSS 3** — estilização utilitária
- **React Router 6** — navegação SPA
- **Axios** — requisições HTTP com interceptors
- **Recharts** — gráficos
- **Lucide React** — ícones
- **i18next** — internacionalização

### Backend
- **Node.js** + **Express** — servidor HTTP
- **TypeScript** — tipagem estática
- **Prisma 7** — ORM com type-safety
- **JWT** + **bcryptjs** — autenticação segura
- **Multer** — upload de arquivos
- **Resend** — envio de emails transacionais

### Banco e Deploy
- **PostgreSQL** (hospedado na **Neon**)
- **Vercel** — hospedagem do frontend
- **Render** — hospedagem do backend

---

## 📦 Estrutura

```
App_finanças/
├── frontend/          # SPA React + Vite
│   ├── src/
│   │   ├── components/    # Modais, seções, botões reutilizáveis
│   │   ├── contexts/      # AuthContext, ThemeContext
│   │   ├── pages/         # Login, Register, Dashboard, ForgotPassword
│   │   ├── i18n/locales/  # pt-BR, pt-PT, en, fr
│   │   └── lib/           # api.ts, config.ts
│   └── public/
└── backend/           # API REST Express
    ├── src/
    │   ├── routes/        # auth, transactions, categories, goals, budgets
    │   ├── middlewares/   # auth (JWT), upload (multer)
    │   └── lib/           # prisma, email
    └── prisma/
        └── schema.prisma  # User, Transaction, Category, Goal, Budget
```

---

## 🏃 Rodando localmente

### Pré-requisitos
- [Node.js LTS](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/) (ou conta gratuita na [Neon](https://neon.tech))
- [Git](https://git-scm.com)

### 1. Clone o repositório
```bash
git clone https://github.com/Andressamn/sistema_financas.git
cd sistema_financas
```

### 2. Configure o backend
```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com sua DATABASE_URL e gere um JWT_SECRET
npx prisma migrate dev
npm run dev
```
> Backend roda em `http://localhost:3000`

### 3. Configure o frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# .env: VITE_API_URL=http://localhost:3000
npm run dev
```
> Frontend roda em `http://localhost:5173`

---

## 🗺️ Roadmap

Em construção:
- [ ] **Importação OFX/CSV** — leitura de extratos bancários
- [ ] **Cartão de crédito** — fatura, parcelas, fechamento
- [ ] **Carteira compartilhada** — uso multi-usuário (casal, família)
- [ ] **Transações recorrentes** — assinaturas e salário automatizados
- [ ] **App mobile** — versão React Native

---

## 👩‍💻 Autora

Feito com 💚 por [@Andressamn](https://github.com/Andressamn) — meu primeiro projeto full stack.

Este sistema nasceu de uma necessidade real: organizar minhas finanças. Acabou virando uma forma de aprender Node, React, TypeScript, Prisma, JWT, deploy e i18n na prática.

---

## 📄 Licença

MIT — sinta-se livre para usar, modificar e distribuir.
