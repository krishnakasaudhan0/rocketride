/**
 * Test script to simulate realistic Stripe chargeback webhooks
 * Usage: bun src/test-webhook.ts [saas|ecom|fraud]
 */

const scenario = process.argv[2] || 'saas';

let payload: any;

if (scenario === 'ecom') {
  payload = {
    id: `evt_stripe_ecom_${Date.now()}`,
    type: 'charge.dispute.created',
    data: {
      object: {
        id: `dp_stripe_ecom_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 89900,
        currency: 'usd',
        reason: 'product_not_received',
        charge: `ch_ecom_${Date.now()}`,
        created: Math.floor(Date.now() / 1000),
        evidence_details: { due_by: Math.floor(Date.now() / 1000) + 5 * 86400 },
        evidence: {
          billing_address: { name: 'Sarah Chen' },
          customer_email_address: 'sarah.chen@studioaudio.com',
        },
        payment_method_details: { card: { last4: '1092' } },
        metadata: { business_type: 'E-Commerce' },
      },
    },
  };
} else if (scenario === 'fraud') {
  payload = {
    id: `evt_stripe_low_score_${Date.now()}`,
    type: 'charge.dispute.created',
    data: {
      object: {
        id: `dp_stripe_suspicious_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 120000,
        currency: 'usd',
        reason: 'fraudulent',
        charge: `ch_fraud_${Date.now()}`,
        created: Math.floor(Date.now() / 1000),
        evidence_details: { due_by: Math.floor(Date.now() / 1000) + 3 * 86400 },
        evidence: {
          billing_address: { name: 'Anonymous Buyer' },
          customer_email_address: 'fraud_account@disposable.com',
        },
        payment_method_details: { card: { last4: '0000' } },
        metadata: { business_type: 'SaaS' },
      },
    },
  };
} else {
  // SaaS High Score
  payload = {
    id: `evt_stripe_saas_${Date.now()}`,
    type: 'charge.dispute.created',
    data: {
      object: {
        id: `dp_stripe_saas_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 45000,
        currency: 'usd',
        reason: 'fraudulent',
        charge: `ch_saas_${Date.now()}`,
        created: Math.floor(Date.now() / 1000),
        evidence_details: { due_by: Math.floor(Date.now() / 1000) + 7 * 86400 },
        evidence: {
          billing_address: { name: 'Alexander Vance' },
          customer_email_address: 'alex.vance@vancemedia.io',
        },
        payment_method_details: { card: { last4: '8819' } },
        metadata: { business_type: 'SaaS' },
      },
    },
  };
}

async function main() {
  console.log(`\n📡 Transmitting real Stripe webhook [${payload.type}] to http://localhost:3001/webhooks/stripe...`);

  try {
    const res = await fetch('http://localhost:3001/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();
    console.log(`✓ Webhook Acknowledged by Server (Status: ${res.status}):`, resJson);
    console.log(`\nCheck the operations dashboard at http://localhost:5173 or run curl http://localhost:3001/api/disputes\n`);
  } catch (err: any) {
    console.error(`✗ Error connecting to backend: ${err.message}`);
    console.log(`Ensure the backend is running via: cd backend && bun src/index.ts`);
  }
}

main();
