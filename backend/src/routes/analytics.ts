import { Router, Request, Response } from 'express';
import { fetchMockTelemetry } from '../lib/enrichment/telemetry';

export const analyticsRouter = Router();

/**
 * Stage 4 Internal Analytics Endpoint:
 * Simulates merchant CRM / product analytics telemetry ingestion (Gorgias, Segment, PostHog, Mixpanel).
 */
analyticsRouter.get('/analytics/:customerEmail', (req: Request, res: Response): void => {
  const { customerEmail } = req.params;
  const telemetry = fetchMockTelemetry(customerEmail);
  res.json({
    customerEmail,
    telemetry,
    source: 'mock_analytics_db',
    fetchedAt: new Date().toISOString(),
  });
});
