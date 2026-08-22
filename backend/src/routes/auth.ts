import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/pipeline';
import { getJwtSecret, requireAuth } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimit';

export const authRouter = Router();

const COOKIE_NAME = 'token';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * POST /auth/register
 * Creates a new user with bcrypt password hashing and sets auth cookie.
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: 'REVIEWER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const secret = getJwtSecret();
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions());
    res.status(201).json({
      message: 'Account registered successfully.',
      user,
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

/**
 * POST /auth/login
 * Verifies email/password and returns JWT cookie.
 */
authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions());
    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

/**
 * POST /auth/logout
 * Clears authentication cookie.
 */
authRouter.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully.' });
});

/**
 * GET /auth/me
 * Returns current authenticated user profile.
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response): void => {
  res.json({
    user: req.user,
  });
});
