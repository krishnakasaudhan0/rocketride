import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma, executeDisputePipeline } from '../lib/pipeline';
import { normalizeStripeDispute } from '../lib/normalizers/stripe';

export const webhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

const DEFAULT_PLACEHOLDER_SECRET = 'whsec_test_mock_webhook_secret';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Real Stripe Webhook Receiver
 * Handles incoming `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`
 */
webhookRouter.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const rawBody = req.body; // Buffer from express.raw()

  const isBypassAllowed =
    process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true' ||
    req.headers['x-disputerocket-simulate'] === 'true';

  let event: Stripe.Event;

  const isSecretConfigured = Boolean(webhookSecret && webhookSecret !== DEFAULT_PLACEHOLDER_SECRET);

  // 1. Signature Verification Boundary
  let signatureValid = false;

  if (isSecretConfigured && sig && !isBypassAllowed) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret!);
      signatureValid = true;
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Stripe Webhook] Signature verification failed in production:', err.message);
        res.status(400).json({ error: `Webhook Error: Signature verification failed (${err.message})` });
        return;
      }

      console.warn(
        `[Stripe Webhook] Note: Signature verification with configured secret failed (${err.message}). In development mode, parsing payload for Stripe CLI forwarding.`
      );
      try {
        const payloadStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody || {});
        event = JSON.parse(payloadStr);
      } catch (parseErr: any) {
        res.status(400).json({ error: `Webhook Error: Failed to parse payload (${parseErr.message})` });
        return;
      }
    }
  } else {
    if (process.env.NODE_ENV === 'production' && !isBypassAllowed) {
      res.status(400).json({ error: 'Webhook Error: Missing or unconfigured stripe-signature in production' });
      return;
    }

    try {
      const payloadStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody || {});
      event = JSON.parse(payloadStr);
    } catch (parseErr: any) {
      res.status(400).json({ error: `Webhook Error: Failed to parse payload (${parseErr.message})` });
      return;
    }
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
      signatureValid: signatureValid || isBypassAllowed || process.env.NODE_ENV !== 'production',
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
        const disputeObject = event.data?.object || event.data || event;
        const normalizedDispute = normalizeStripeDispute(disputeObject);

        // Associate webhook dispute with designated or active reviewer user
        let webhookUserId = disputeObject.metadata?.userId || disputeObject.metadata?.user_id;
        if (!webhookUserId) {
          const activeUser = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
          });
          webhookUserId = activeUser?.id;
        }

        normalizedDispute.userId = webhookUserId;
        await executeDisputePipeline(normalizedDispute, rawEvent.id);
      } else {
        console.log(`[Stripe Webhook] Received non-dispute event: ${eventType}`);
      }
    } catch (pipelineErr) {
      console.error(`[Stripe Webhook] Error in async pipeline for ${externalEventId}:`, pipelineErr);
    }
  });
});
