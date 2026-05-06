import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { sendPasswordResetEmail } from '../lib/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body ?? {};

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password e name são obrigatórios' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'email já cadastrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'credenciais inválidas' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: 'email obrigatório' });

    const user = await prisma.user.findUnique({ where: { email } });

    // Sempre respondemos OK pra não revelar se o email está cadastrado
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiresAt: expires },
      });

      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail(email, resetUrl);
      } catch (mailErr) {
        console.error('Erro ao enviar email de redefinição:', mailErr);
        // Mesmo se email falhar, retornamos OK — o link foi gerado e está no console (dev)
      }
    }

    return res.json({ message: 'Se este email existir, enviamos um link de redefinição.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body ?? {};
    if (!token || !password) {
      return res.status(400).json({ error: 'token e password são obrigatórios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'a senha deve ter pelo menos 6 caracteres' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return res.json({ message: 'senha atualizada' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'erro interno' });
  }
});

export default router;
