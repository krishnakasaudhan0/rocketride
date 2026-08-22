export interface UnsavedDispute {
  userId?: string;
  processor: string;
  externalDisputeId: string;
  chargeId: string;
  amountCents: number;
  currency: string;
  reasonRaw: string;
  reasonCanonical: 'FRAUD' | 'PRODUCT_NOT_RECEIVED' | 'PRODUCT_NOT_AS_DESCRIBED' | 'DUPLICATE_BILLING' | 'SUBSCRIPTION_CANCELLED' | 'OTHER';
  customerName?: string;
  customerEmail?: string;
  cardLast4?: string;
  businessType?: string;
  evidenceDueBy: Date;
  status: string;
}

/**
 * Maps raw Stripe dispute reasons to canonical dispute types.
 */
export function mapStripeReasonToCanonical(
  rawReason: string
): 'FRAUD' | 'PRODUCT_NOT_RECEIVED' | 'PRODUCT_NOT_AS_DESCRIBED' | 'DUPLICATE_BILLING' | 'SUBSCRIPTION_CANCELLED' | 'OTHER' {
  const reason = (rawReason || '').toLowerCase().trim();
  switch (reason) {
    case 'fraudulent':
      return 'FRAUD';
    case 'product_not_received':
      return 'PRODUCT_NOT_RECEIVED';
    case 'product_unacceptable':
      return 'PRODUCT_NOT_AS_DESCRIBED';
    case 'duplicate':
    case 'credit_not_processed':
      return 'DUPLICATE_BILLING';
    case 'subscription_canceled':
    case 'subscription_cancelled':
      return 'SUBSCRIPTION_CANCELLED';
    default:
      return 'OTHER';
  }
}

/**
 * Normalizes a raw Stripe dispute object or webhook payload into our canonical Dispute schema.
 */
export function normalizeStripeDispute(rawPayload: any): UnsavedDispute {
  // Support both dispute object directly or nested event data.object
  const dispute = rawPayload?.data?.object ? rawPayload.data.object : rawPayload;

  const rawReason = dispute.reason || 'other';
  const reasonCanonical = mapStripeReasonToCanonical(rawReason);

  // Evidence deadline calculation
  let evidenceDueBy: Date;
  if (dispute.evidence_details?.due_by) {
    evidenceDueBy = new Date(dispute.evidence_details.due_by * 1000);
  } else if (dispute.created) {
    evidenceDueBy = new Date((dispute.created + 7 * 86400) * 1000);
  } else {
    evidenceDueBy = new Date(Date.now() + 7 * 86400 * 1000);
  }

  // Extract customer and card details from charge or metadata if available
  const charge = dispute.charge;
  const chargeId = typeof charge === 'string' ? charge : charge?.id || dispute.payment_intent || 'ch_unknown';

  const customerName =
    dispute.evidence?.billing_address?.name ||
    dispute.evidence?.customer_name ||
    dispute.metadata?.customer_name ||
    (typeof charge === 'object' ? charge?.billing_details?.name : undefined) ||
    'Valued Customer';

  const customerEmail =
    dispute.evidence?.customer_email_address ||
    dispute.metadata?.customer_email ||
    (typeof charge === 'object' ? charge?.billing_details?.email : undefined) ||
    'customer@example.com';

  const cardLast4 =
    dispute.payment_method_details?.card?.last4 ||
    (typeof charge === 'object' ? charge?.payment_method_details?.card?.last4 : undefined) ||
    '4242';

  const businessType =
    dispute.metadata?.business_type ||
    (reasonCanonical === 'SUBSCRIPTION_CANCELLED' ? 'SaaS' : 'SaaS');

  return {
    processor: 'stripe',
    externalDisputeId: dispute.id || `dp_${Date.now()}`,
    chargeId,
    amountCents: dispute.amount || 45000,
    currency: (dispute.currency || 'usd').toUpperCase(),
    reasonRaw: rawReason,
    reasonCanonical,
    customerName,
    customerEmail,
    cardLast4,
    businessType,
    evidenceDueBy,
    status: 'INGESTED',
  };
}
