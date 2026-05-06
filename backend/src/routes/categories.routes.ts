import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, type AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, type } = req.body ?? {};
    if (!name || !type) return res.status(400).json({ error: 'name e type são obrigatórios' });
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type deve ser "income" ou "expense"' });
    }
    const category = await prisma.category.create({
      data: { name, type, userId: req.userId! },
    });
    return res.status(201).json(category);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'já existe categoria com esse nome' });
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: 'asc' },
  });
  return res.json(categories);
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, type } = req.body ?? {};

    const found = await prisma.category.findFirst({ where: { id, userId: req.userId } });
    if (!found) return res.status(404).json({ error: 'não encontrada' });

    const updated = await prisma.category.update({
      where: { id },
      data: { name, type },
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const found = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!found) return res.status(404).json({ error: 'não encontrada' });

  await prisma.category.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
