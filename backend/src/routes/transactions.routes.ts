import { Router, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authMiddleware, type AuthRequest } from '../middlewares/auth.middleware';
import { uploadReceipt, uploadsPath } from '../middlewares/upload.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type, description, date, categoryId } = req.body ?? {};
    if (amount === undefined || !type) {
      return res.status(400).json({ error: 'amount e type são obrigatórios' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type deve ser "income" ou "expense"' });
    }
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        date: date ? new Date(date) : undefined,
        categoryId,
        userId: req.userId!,
      },
    });
    return res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query;
  const where: any = { userId: req.userId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from as string);
    if (to) where.date.lt = new Date(to as string);
  }
  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  });
  return res.json(transactions);
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const found = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
    if (!found) return res.status(404).json({ error: 'não encontrada' });

    const { amount, type, description, date, categoryId } = req.body ?? {};
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        description,
        date: date ? new Date(date) : undefined,
        categoryId,
      },
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const found = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!found) return res.status(404).json({ error: 'não encontrada' });

  // remove arquivo do receipt se existir
  if (found.receiptUrl) {
    const filePath = path.join(uploadsPath, path.basename(found.receiptUrl));
    fs.promises.unlink(filePath).catch(() => null);
  }

  await prisma.transaction.delete({ where: { id } });
  return res.status(204).send();
});

// Upload do comprovante
router.post('/:id/receipt', uploadReceipt.single('receipt'), async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const found = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
    if (!found) {
      // remove arquivo enviado pra não acumular lixo
      if (req.file) fs.promises.unlink(req.file.path).catch(() => null);
      return res.status(404).json({ error: 'transação não encontrada' });
    }
    if (!req.file) return res.status(400).json({ error: 'arquivo não enviado' });

    // remove arquivo antigo se houver
    if (found.receiptUrl) {
      const oldPath = path.join(uploadsPath, path.basename(found.receiptUrl));
      fs.promises.unlink(oldPath).catch(() => null);
    }

    const url = `/uploads/${req.file.filename}`;
    const updated = await prisma.transaction.update({
      where: { id },
      data: { receiptUrl: url },
    });
    return res.json(updated);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message ?? 'erro interno' });
  }
});

// Remove o comprovante
router.delete('/:id/receipt', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const found = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!found) return res.status(404).json({ error: 'não encontrada' });

  if (found.receiptUrl) {
    const filePath = path.join(uploadsPath, path.basename(found.receiptUrl));
    fs.promises.unlink(filePath).catch(() => null);
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: { receiptUrl: null },
  });
  return res.json(updated);
});

export default router;
