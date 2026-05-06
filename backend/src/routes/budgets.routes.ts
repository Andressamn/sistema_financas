import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, type AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(budgets);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, amount } = req.body ?? {};
    if (!categoryId || amount === undefined) {
      return res.status(400).json({ error: 'categoryId e amount são obrigatórios' });
    }

    // garante que a categoria pertence ao usuário
    const cat = await prisma.category.findFirst({ where: { id: categoryId, userId: req.userId } });
    if (!cat) return res.status(404).json({ error: 'categoria não encontrada' });

    const budget = await prisma.budget.create({
      data: { categoryId, amount, userId: req.userId! },
      include: { category: true },
    });
    return res.status(201).json(budget);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'já existe orçamento para essa categoria' });
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const found = await prisma.budget.findFirst({ where: { id, userId: req.userId } });
    if (!found) return res.status(404).json({ error: 'não encontrado' });

    const { amount } = req.body ?? {};
    const updated = await prisma.budget.update({
      where: { id },
      data: { amount },
      include: { category: true },
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const found = await prisma.budget.findFirst({ where: { id, userId: req.userId } });
  if (!found) return res.status(404).json({ error: 'não encontrado' });

  await prisma.budget.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
