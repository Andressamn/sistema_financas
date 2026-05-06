import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes';
import categoriesRoutes from './routes/categories.routes';
import transactionsRoutes from './routes/transactions.routes';
import goalsRoutes from './routes/goals.routes';
import budgetsRoutes from './routes/budgets.routes';
import { uploadsPath } from './middlewares/upload.middleware';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// CORS: em prod aceita só FRONTEND_URL. Em dev (sem env), aceita tudo.
const corsOrigin = process.env.FRONTEND_URL || true;
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Servir uploads estaticamente
app.use('/uploads', express.static(uploadsPath));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'API de finanças no ar 🚀' });
});

app.use('/auth', authRoutes);
app.use('/categories', categoriesRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/goals', goalsRoutes);
app.use('/budgets', budgetsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
