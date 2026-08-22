import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import type { DisputeScenario } from '../data/mockDisputes';

interface CustomDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDispute: (scenario: DisputeScenario) => void;
}

export const CustomDisputeModal: React.FC<CustomDisputeModalProps> = ({
  isOpen,
  onClose,
  onCreateDispute,
}) => {
  const [customerName, setCustomerName] = useState('Elena Rostova');
  const [customerEmail, setCustomerEmail] = useState('elena.rostova@enterprise.tech');
  const [productName, setProductName] = useState('Enterprise Cloud Infrastructure & AI Compute Tier');
  const [amount, setAmount] = useState('650.00');
  const [businessType, setBusinessType] = useState<'SaaS' | 'E-Commerce'>('SaaS');
  const [processor, setProcessor] = useState<'STRIPE' | 'SHOPIFY' | 'PAYPAL'>('STRIPE');
  const [reasonCode, setReasonCode] = useState('10.4_FRAUD_CARD_ABSENT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 450.0;
    const dispId = `dp_custom_${Math.floor(Math.random() * 8999 + 1000)}`;

    const customScenario: DisputeScenario = {
      id: `custom-${Date.now()}`,
      title: `Custom Dispute — $${numAmount.toFixed(2)} (${customerName})`,
      businessType,
      disputeId: dispId,
      transactionId: `txn_cust_${Math.floor(Math.random() * 89999 + 10000)}`,
      orderId: `ord_cust_${Math.floor(Math.random() * 89999 + 10000)}`,
      customerId: `cust_${customerEmail.split('@')[0]}`,
      customerName,
      customerEmail,
      processor,
      amount: numAmount,
      currency: 'USD',
      reasonCode,
      reasonDescription: `Cardholder filed chargeback dispute claiming ${reasonCode}.`,
      deadlineDays: 7,
      hoursRemaining: 168,
      order: {
        productName,
        orderDate: '2026-08-10 14:00 UTC',
        cardLast4: '4820',
        cardBrand: 'VISA',
        avsMatch: true,
        cvvMatch: true,
        ipAddress: '198.51.100.99 (San Francisco, CA)',
        billingAddress: '500 Howard St, San Francisco, CA 94105',
        termsAccepted: true,
      },
      telemetry:
        businessType === 'SaaS'
          ? {
              activeHours: 29.5,
              loginCount: 8,
              twoFactorVerified: true,
              apiCallsCount: 2840,
              lastActiveDate: '2026-08-19 18:30 UTC',
              deviceFingerprint: 'macOS_Chrome_ARM64_Verified',
              featuresUsed: ['Compute_API', 'Storage_Engine', 'Analytics_Dashboard'],
            }
          : undefined,
      delivery:
        businessType === 'E-Commerce'
          ? {
              carrier: 'UPS Worldwide Express',
              trackingNumber: '1Z9999999999999999',
              shippedDate: '2026-08-12 10:00 UTC',
              deliveredDate: '2026-08-15 15:30 UTC',
              signedBy: customerName.toUpperCase(),
              gpsCoordinates: '37.7749° N, 122.4194° W',
              status: 'DELIVERED',
            }
          : undefined,
      customerHistory: {
        lifetimeOrders: 2,
        lifetimeSpend: numAmount * 2,
        pastDisputesWon: 1,
        pastDisputesLost: 0,
        trustScore: 92,
      },
      aiAnalysis: {
        winProbability: 0.95,
        strategy: 'Multi-Factor Session Correlation & Cryptographic Checkout Policy Affirmation',
        evidenceStrengths: [
          'Full AVS & CVV2 verification matched at transaction processing',
          businessType === 'SaaS'
            ? '29.5 active enterprise usage hours logged across 8 authenticated 2FA sessions'
            : 'Carrier tracking and recipient signature verified at matching delivery address',
          'Affirmative checkbox consent to merchant terms & cancellation policy',
        ],
        exhibits: [
          {
            number: 'Exhibit A',
            title: 'Payment Authorization & Security Verification',
            category: 'PAYMENT_PROOF',
            summary: `Tokenized transaction receipt confirming AVS and CVV match for ${customerName}.`,
          },
          {
            number: 'Exhibit B',
            title:
              businessType === 'SaaS'
                ? 'Authenticated Session Telemetry & 2FA Audit'
                : 'Carrier Proof of Delivery & Recipient Signature',
            category: businessType === 'SaaS' ? 'USAGE_TELEMETRY' : 'PROOF_OF_DELIVERY',
            summary:
              businessType === 'SaaS'
                ? 'Audit trails proving active usage and 2FA authentication post-purchase.'
                : `Delivery signature '${customerName.toUpperCase()}' matching verified address.`,
          },
          {
            number: 'Exhibit C',
            title: 'Terms of Service Acceptance',
            category: 'TERMS_ACCEPTANCE',
            summary: 'Timestamped consent log demonstrating explicit acceptance of terms.',
          },
        ],
        rebuttalLetter: `REPRESENTMENT REBUTTAL STATEMENT
To: ${processor} Dispute Resolution & Card Issuing Bank
Dispute Reference: ${dispId} | Amount: $${numAmount.toFixed(2)} USD
Cardholder: ${customerName} | Reason: ${reasonCode}

Dear Chargeback Review Team,

This document serves as formal contestation of the chargeback initiated by ${customerName}. We provide conclusive evidence demonstrating that the cardholder authorized the purchase and received full commercial benefit of the service.

I. SECURITY VERIFICATION
- Address Verification Service (AVS): PASS / FULL MATCH
- Card Verification Value (CVV2): PASS / FULL MATCH

II. EVIDENCE OF FULFILLMENT & UTILIZATION
${
  businessType === 'SaaS'
    ? 'The cardholder actively utilized the platform for 29.5 hours across 8 authenticated sessions with 2FA verification.'
    : `The physical merchandise was shipped via carrier and delivered directly to the billing address with signature confirmation '${customerName.toUpperCase()}'.`
}

III. RECOVERY REQUEST
In accordance with payment network core dispute rules, we respectfully request immediate reversal of this chargeback and release of the $${numAmount.toFixed(2)} USD to the merchant.

Respectfully submitted,
DisputeRocket Automated Settlement Unit`,
      },
    };

    onCreateDispute(customScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Create Custom Dispute Simulation</h3>
            <p className="text-xs text-slate-400">
              Test DisputeRocket against any real-world merchant scenario
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Customer Name:</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Customer Email:</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Business Type:</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="SaaS">SaaS Platform</option>
                <option value="E-Commerce">E-Commerce Store</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Gateway:</label>
              <select
                value={processor}
                onChange={(e) => setProcessor(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="STRIPE">Stripe</option>
                <option value="SHOPIFY">Shopify</option>
                <option value="PAYPAL">PayPal</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Amount ($ USD):</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Product / Plan Title:</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Dispute Reason Code:</label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="10.4_FRAUD_CARD_ABSENT">10.4 - Fraud / Card Absent (Visa)</option>
              <option value="13.1_MERCHANDISE_NOT_RECEIVED">13.1 - Merchandise Not Received</option>
              <option value="4853_DEFECTIVE_OR_CANCELLED">4853 - Cancelled Recurring / Defective</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Simulate Pipeline Defense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
