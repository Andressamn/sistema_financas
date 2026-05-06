import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, type AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, targetAmount, currentAmount, deadline } = req.body ?? {};
    if (!name || targetAmount === undefined) {
      return res.status(400).json({ error: 'name e targetAmount são obrigatórios' });
    }
    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount,
        currentAmount: currentAmount ?? 0,
        deadline: deadline ? new Date(deadline) : null,
        userId: req.userId!,
      },
    });
    return res.status(201).json(goal);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const goals = await prisma.goal.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(goals);
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const found = await prisma.goal.findFirst({ where: { id, userId: req.userId } });
    if (!found) return res.status(404).json({ error: 'não encontrada' });

    const { name, targetAmount, currentAmount, deadline } = req.body ?? {};
    const updated = await prisma.goal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        currentAmount,
        deadline: deadline ? new Date(deadline) : undefined,
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
  const found = await prisma.goal.findFirst({ where: { id, userId: req.userId } });
  if (!found) return res.status(404).json({ error: 'não encontrada' });

  await prisma.goal.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
