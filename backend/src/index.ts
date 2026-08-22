import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { webhookRouter } from './routes/webhooks';
import { analyticsRouter } from './routes/analytics';
import { disputeRouter } from './routes/disputes';
import { authRouter } from './routes/auth';
import { requireAuth } from './middleware/auth';

dotenv.config();

// Fail startup loudly if JWT_SECRET is unset in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable must be set in production.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS with allowed origins, Vercel wildcards, and credentials
const defaultOrigins = [
  'https://disputerocket.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const envAllowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envAllowed]));

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin "${origin}" is not in allowlist:`, allowedOrigins);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Raw body parser for Stripe Webhook Signature Verification
app.use(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' })
);

// Standard JSON and Cookie parsers for all other routes
app.use(express.json());
app.use(cookieParser());

// Public Route Handlers
app.use('/auth', authRouter);
app.use('/webhooks', webhookRouter);

// Protected Route Handlers (Require valid JWT Cookie)
app.use('/internal', requireAuth, analyticsRouter);
app.use('/api/disputes', requireAuth, disputeRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'DisputeRocket Ingestion Engine',
    timestamp: new Date().toISOString(),
  });
});

const portNumber = Number(PORT) || 3001;
app.listen(portNumber, '0.0.0.0', () => {
  console.log(`\n🚀 DisputeRocket Backend running on http://0.0.0.0:${portNumber}`);
  console.log(`   • Auth Endpoints: POST /auth/register, /auth/login`);
  console.log(`   • Stripe Webhook Receiver: POST /webhooks/stripe`);
  console.log(`   • Operations Dashboard API: GET /api/disputes\n`);
});
