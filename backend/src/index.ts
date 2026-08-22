import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { webhookRouter } from './routes/webhooks';
import { analyticsRouter } from './routes/analytics';
import { disputeRouter } from './routes/disputes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Raw body parser for Stripe Webhook Signature Verification
app.use(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' })
);

// Standard JSON parser for all other routes
app.use(express.json());

// Mount Route Handlers
app.use('/webhooks', webhookRouter);
app.use('/internal', analyticsRouter);
app.use('/api/disputes', disputeRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DisputeRocket Ingestion Engine',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 DisputeRocket Backend running on http://localhost:${PORT}`);
  console.log(`   • Stripe Webhook Receiver: POST http://localhost:${PORT}/webhooks/stripe`);
  console.log(`   • Telemetry Enrichment API: GET http://localhost:${PORT}/internal/analytics/:email`);
  console.log(`   • Operations Dashboard API: GET http://localhost:${PORT}/api/disputes\n`);
});
