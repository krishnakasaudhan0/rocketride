import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma, executeDisputePipeline } from '../lib/pipeline';
import { normalizeStripeDispute } from '../lib/normalizers/stripe';

export const webhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock_webhook_secret';

/**
 * Real Stripe Webhook Receiver
 * Handles incoming `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`
 */
webhookRouter.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const rawBody = req.body; // Buffer from express.raw()

  let event: Stripe.Event;

  // 1. Signature Verification
  try {
    if (sig && webhookSecret && !webhookSecret.includes('mock')) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // In local dev/test mode without live Stripe CLI signing secret, parse safely
      const payloadStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);
      event = JSON.parse(payloadStr);
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);

    // Save failed raw webhook event
    await prisma.rawWebhookEvent.create({
      data: {
        processor: 'stripe',
        externalEventId: `failed_sig_${Date.now()}_${Math.random()}`,
        eventType: 'unknown',
        payload: Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody || {}),
        signatureValid: false,
        processed: false,
      },
    }).catch(() => null);

    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  const externalEventId = event.id || `evt_${Date.now()}`;
  const eventType = event.type || 'charge.dispute.created';

  // 2. Idempotency Check: check if event was already received
  const existingEvent = await prisma.rawWebhookEvent.findUnique({
    where: { externalEventId },
  });

  if (existingEvent) {
    console.log(`[Stripe Webhook] Duplicate event ${externalEventId} ignored (idempotent ack).`);
    res.status(200).json({ received: true, idempotent: true });
    return;
  }

  // 3. Insert Raw Webhook Event
  const rawPayloadStr = JSON.stringify(event);
  const rawEvent = await prisma.rawWebhookEvent.create({
    data: {
      processor: 'stripe',
      externalEventId,
      eventType,
      payload: rawPayloadStr,
      signatureValid: true,
      processed: false,
    },
  });

  // 4. Fast 200 Ack to Stripe immediately
  res.status(200).json({ received: true, eventId: externalEventId });

  // 5. Asynchronous Background Pipeline Execution (Stage 3 -> 4 -> 5 -> 6)
  setImmediate(async () => {
    try {
      if (
        eventType === 'charge.dispute.created' ||
        eventType === 'charge.dispute.updated' ||
        eventType === 'charge.dispute.funds_withdrawn' ||
        eventType.includes('dispute')
      ) {
        console.log(`[Stripe Webhook] Processing dispute event ${externalEventId}...`);
        const normalizedDispute = normalizeStripeDispute(event.data.object);
        await executeDisputePipeline(normalizedDispute, rawEvent.id);
      } else {
        console.log(`[Stripe Webhook] Received non-dispute event ${eventType}.`);
      }
    } catch (pipelineErr) {
      console.error(`[Stripe Webhook] Error in async pipeline for ${externalEventId}:`, pipelineErr);
    }
  });
});
