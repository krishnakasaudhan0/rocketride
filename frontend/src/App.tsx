import { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  RotateCcw,
  Copy,
  Check,
  Scale,
  DollarSign,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DisputeInput {
  disputeId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  processor: 'Stripe' | 'Shopify' | 'PayPal' | 'Adyen';
  reasonCode: string;
  orderItem: string;
  cardLast4: string;
  avsMatch: boolean;
  cvvMatch: boolean;
  businessType: 'SaaS' | 'E-Commerce';
  // SaaS signals
  activeHours?: number;
  twoFactorVerified?: boolean;
  // Physical signals
  carrier?: string;
  trackingNumber?: string;
  recipientSignature?: string;
}

interface EvidenceResult {
  winProbability: number;
  strategy: string;
  exhibits: { title: string; category: string; summary: string }[];
  rebuttalLetter: string;
  submissionToken?: string;
}

export function App() {
  // Initial clean form state
  const [form, setForm] = useState<DisputeInput>({
    disputeId: 'dp_' + Math.floor(100000 + Math.random() * 900000),
    customerName: '',
    customerEmail: '',
    amount: 450.0,
    currency: 'USD',
    processor: 'Stripe',
    reasonCode: '10.4 Fraud - Card Absent',
    orderItem: 'Pro Annual Subscription',
    cardLast4: '4242',
    avsMatch: true,
    cvvMatch: true,
    businessType: 'SaaS',
    activeHours: 38.5,
    twoFactorVerified: true,
    carrier: 'FedEx Priority',
    trackingNumber: '781290481290',
    recipientSignature: '',
  });

  // Pipeline Stages:
  // 0: Form Intake
  // 1: Multi-Source Correlation
  // 2: RocketRide Pipeline (Gemini 2.5 Flash)
  // 3: Mandatory Human Review Gate
  // 4: Submitted to Gateway
  // 5: Outcome Won & Learning Loop
  const [stage, setStage] = useState<number>(0);
  const [evidence, setEvidence] = useState<EvidenceResult | null>(null);
  const [editableLetter, setEditableLetter] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Quick fill demo helper
  const handleQuickFill = (type: 'SaaS' | 'E-Commerce') => {
    if (type === 'SaaS') {
      setForm({
        disputeId: 'dp_saas_' + Math.floor(1000 + Math.random() * 9000),
        customerName: 'Alexander Vance',
        customerEmail: 'alex.vance@company.io',
        amount: 450.0,
        currency: 'USD',
        processor: 'Stripe',
        reasonCode: '10.4 Fraud - Card Absent',
        orderItem: 'Cloud Pro Annual Subscription',
        cardLast4: '8819',
        avsMatch: true,
        cvvMatch: true,
        businessType: 'SaaS',
        activeHours: 38.5,
        twoFactorVerified: true,
      });
    } else {
      setForm({
        disputeId: 'dp_ecom_' + Math.floor(1000 + Math.random() * 9000),
        customerName: 'Sarah Chen',
        customerEmail: 'sarah.chen@audio.com',
        amount: 899.0,
        currency: 'USD',
        processor: 'Shopify',
        reasonCode: '13.1 Merchandise Not Received',
        orderItem: 'Studio Reference Headphones',
        cardLast4: '1092',
        avsMatch: true,
        cvvMatch: true,
        businessType: 'E-Commerce',
        carrier: 'FedEx Priority Overnight',
        trackingNumber: '781290481290',
        recipientSignature: 'S. CHEN',
      });
    }
  };

  // Run RocketRide Pipeline
  const handleRunPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail || !form.amount) return;

    setStage(1); // Ingesting

    setTimeout(() => {
      setStage(2); // Gemini Processing

      setTimeout(() => {
        // Compile Evidence Package dynamically based on user input
        const isSaaS = form.businessType === 'SaaS';
        const winProb = (form.avsMatch && form.cvvMatch) ? 0.96 : 0.85;

        const exhibits = [
          {
            title: 'Exhibit A: Payment Authorization & AVS/CVV Security',
            category: 'PAYMENT_PROOF',
            summary: `Verified transaction metadata showing AVS ${form.avsMatch ? 'FULL MATCH' : 'NO MATCH'} and CVV ${form.cvvMatch ? 'PASS' : 'FAIL'} on card ending in ${form.cardLast4}.`,
          },
          {
            title: isSaaS
              ? 'Exhibit B: User Session Telemetry & 2FA Audit'
              : 'Exhibit B: Carrier Proof of Delivery & Signature',
            category: isSaaS ? 'USAGE_TELEMETRY' : 'PROOF_OF_DELIVERY',
            summary: isSaaS
              ? `Server telemetry audit logging ${form.activeHours || 24} hours of authenticated dashboard usage with ${form.twoFactorVerified ? '2FA verification' : 'standard login'}.`
              : `Carrier tracking (${form.carrier || 'Carrier'} #${form.trackingNumber || 'N/A'}) confirmed delivered with signature '${form.recipientSignature || form.customerName.toUpperCase()}'.`,
          },
          {
            title: 'Exhibit C: Terms of Service & Cancellation Policy',
            category: 'TERMS_ACCEPTANCE',
            summary: `Timestamped checkout record proving customer affirmatively accepted merchant terms and cancellation policies for ${form.orderItem}.`,
          },
        ];

        const letter = `REPRESENTMENT REBUTTAL STATEMENT
To: ${form.processor} Dispute Resolution & Card Issuing Bank
Dispute ID: ${form.disputeId} | Disputed Amount: $${form.amount.toFixed(2)} ${form.currency}
Reason Code: ${form.reasonCode}
Cardholder: ${form.customerName} (${form.customerEmail}) | Card: *${form.cardLast4}

Dear Chargeback Resolution Specialist,

We provide formal contestation and evidence proving the cardholder authorized the transaction for "${form.orderItem}", received full commercial benefit, and consented to merchant terms.

I. TRANSACTION AUTHENTICATION & FRAUD REFUTATION
- Address Verification Service (AVS): ${form.avsMatch ? 'PASS / FULL MATCH' : 'UNAVAILABLE'}
- Card Verification Value (CVV2): ${form.cvvMatch ? 'PASS / MATCHED' : 'UNAVAILABLE'}
- Cardholder Name: ${form.customerName}

II. PROOF OF FULFILLMENT & UTILIZATION
${
  isSaaS
    ? `The cardholder actively utilized the SaaS platform for ${form.activeHours || 24} hours across multiple authenticated sessions ${form.twoFactorVerified ? 'with 2-Factor Authentication' : ''}. Persistent authenticated access refutes the claim of unauthorized transaction.`
    : `The merchandise was dispatched via ${form.carrier || 'Carrier'} (Tracking #${form.trackingNumber || 'N/A'}) and confirmed delivered to the cardholder billing address with signature confirmation '${form.recipientSignature || form.customerName.toUpperCase()}'.`
}

III. REQUEST FOR REVERSAL
In accordance with payment network core chargeback rules, we respectfully request immediate reversal of this dispute and release of the contested $${form.amount.toFixed(2)} ${form.currency} to the merchant account.

Respectfully submitted,
Dispute Defense Operations, DisputeRocket Automated Settlement Unit`;

        setEvidence({
          winProbability: winProb,
          strategy: isSaaS
            ? 'Multi-Factor Telemetry & Persistent Platform Utilization Compendium'
            : 'Indisputable Carrier Delivery Confirmation with Signature',
          exhibits,
          rebuttalLetter: letter,
        });

        setEditableLetter(letter);
        setStage(3); // Ready for Human Review
      }, 1400);
    }, 1000);
  };

  // Human Review Approval & Submission
  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    setStage(4); // Submitting

    setTimeout(() => {
      setStage(5); // Won
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#ffffff'],
      });
    }, 1200);
  };

  // Reset
  const handleReset = () => {
    setStage(0);
    setEvidence(null);
    setReviewerName('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Commercial Revenue
  const flatFee = 25.0;
  const contingencyFee = form.amount * 0.15;
  const totalRevenue = flatFee + contingencyFee;
  const netSaved = form.amount - totalRevenue;

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-white flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-neutral-800/80 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">DisputeRocket</span>
            <span className="text-[11px] text-neutral-500 font-mono">/ Core Pipeline</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
              <Cpu className="h-3.5 w-3.5 text-neutral-500" />
              <span>RocketRide AI</span>
              <span className="text-neutral-600">•</span>
              <span className="text-indigo-400">Gemini 2.5 Flash</span>
            </div>

            {stage > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>New Dispute</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Pipeline Execution Stepper (Shows when running) */}
        {stage > 0 && (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-mono mb-3 text-neutral-400">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Pipeline: dispute_defense.pipe
              </span>
              <span>
                {stage === 1 && 'Ingesting Signals...'}
                {stage === 2 && 'Gemini LLM Synthesizing...'}
                {stage === 3 && 'Awaiting Human Review'}
                {stage === 4 && 'Submitting to Gateway...'}
                {stage === 5 && 'Outcome: WON ($' + form.amount.toFixed(2) + ' Recovered)'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-mono">
              <div
                className={`py-1.5 px-1 rounded border transition ${
                  stage >= 1
                    ? 'bg-neutral-900 border-neutral-700 text-white font-semibold'
                    : 'bg-black border-neutral-900 text-neutral-600'
                }`}
              >
                1. Ingestion
              </div>
              <div
                className={`py-1.5 px-1 rounded border transition ${
                  stage >= 2
                    ? 'bg-neutral-900 border-indigo-500/50 text-indigo-300 font-semibold'
                    : 'bg-black border-neutral-900 text-neutral-600'
                }`}
              >
                2. Gemini AI
              </div>
              <div
                className={`py-1.5 px-1 rounded border transition ${
                  stage >= 3
                    ? 'bg-neutral-900 border-neutral-700 text-white font-semibold'
                    : 'bg-black border-neutral-900 text-neutral-600'
                }`}
              >
                3. Human Check
              </div>
              <div
                className={`py-1.5 px-1 rounded border transition ${
                  stage >= 4
                    ? 'bg-neutral-900 border-neutral-700 text-white font-semibold'
                    : 'bg-black border-neutral-900 text-neutral-600'
                }`}
              >
                4. Gateway
              </div>
              <div
                className={`py-1.5 px-1 rounded border transition ${
                  stage === 5
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 font-semibold'
                    : 'bg-black border-neutral-900 text-neutral-600'
                }`}
              >
                5. Outcome & Learning
              </div>
            </div>
          </div>
        )}

        {/* STAGE 0: MINIMAL INPUT FORM */}
        {stage === 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Enter Payment Dispute Details
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Input customer and transaction signals to generate an AI representment package.
                </p>
              </div>

              {/* Sample Fill Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('SaaS')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[11px] font-medium text-neutral-300 transition cursor-pointer"
                >
                  + Sample SaaS ($450)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('E-Commerce')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[11px] font-medium text-neutral-300 transition cursor-pointer"
                >
                  + Sample E-Com ($899)
                </button>
              </div>
            </div>

            <form
              onSubmit={handleRunPipeline}
              className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-6 space-y-5"
            >
              {/* Row 1: Core Dispute Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Dispute Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    value={form.disputeId}
                    onChange={(e) => setForm({ ...form, disputeId: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                    placeholder="e.g. dp_109281"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Disputed Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Payment Processor
                  </label>
                  <select
                    value={form.processor}
                    onChange={(e) => setForm({ ...form, processor: e.target.value as any })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                  >
                    <option value="Stripe">Stripe</option>
                    <option value="Shopify">Shopify</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Adyen">Adyen</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Customer & Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                    placeholder="e.g. Alexander Vance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                    placeholder="e.g. alex@vance.io"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Product / Subscription Item
                  </label>
                  <input
                    type="text"
                    required
                    value={form.orderItem}
                    onChange={(e) => setForm({ ...form, orderItem: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                    placeholder="e.g. Pro Annual Plan"
                  />
                </div>
              </div>

              {/* Row 3: Dispute Reason & Security Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Dispute Reason Code
                  </label>
                  <input
                    type="text"
                    required
                    value={form.reasonCode}
                    onChange={(e) => setForm({ ...form, reasonCode: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                    placeholder="e.g. 10.4 Fraud - Card Absent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Card Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={form.cardLast4}
                    onChange={(e) => setForm({ ...form, cardLast4: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                    placeholder="4242"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Business Type
                  </label>
                  <select
                    value={form.businessType}
                    onChange={(e) =>
                      setForm({ ...form, businessType: e.target.value as 'SaaS' | 'E-Commerce' })
                    }
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                  >
                    <option value="SaaS">SaaS Platform (Digital)</option>
                    <option value="E-Commerce">E-Commerce Store (Physical)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Evidence Signals (Dynamic based on SaaS vs Physical) */}
              <div className="pt-2 border-t border-neutral-800/80">
                <span className="block text-xs font-mono text-neutral-400 mb-3">
                  {form.businessType === 'SaaS'
                    ? 'SaaS Usage & Telemetry Signals:'
                    : 'Physical Delivery Proof Signals:'}
                </span>

                {form.businessType === 'SaaS' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">
                        Active Usage Hours Logged
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.activeHours || 0}
                        onChange={(e) =>
                          setForm({ ...form, activeHours: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="2fa"
                        checked={form.twoFactorVerified}
                        onChange={(e) => setForm({ ...form, twoFactorVerified: e.target.checked })}
                        className="rounded border-neutral-800 bg-black text-indigo-500 focus:ring-0"
                      />
                      <label htmlFor="2fa" className="text-xs text-neutral-300">
                        2-Factor Authentication Verified
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="avs"
                        checked={form.avsMatch}
                        onChange={(e) => setForm({ ...form, avsMatch: e.target.checked })}
                        className="rounded border-neutral-800 bg-black text-indigo-500 focus:ring-0"
                      />
                      <label htmlFor="avs" className="text-xs text-neutral-300">
                        AVS & CVV Full Match
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">Carrier Name</label>
                      <input
                        type="text"
                        value={form.carrier || ''}
                        onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                        className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                        placeholder="FedEx Priority"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={form.trackingNumber || ''}
                        onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                        className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                        placeholder="781290481290"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">
                        Recipient Signature
                      </label>
                      <input
                        type="text"
                        value={form.recipientSignature || ''}
                        onChange={(e) => setForm({ ...form, recipientSignature: e.target.value })}
                        className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                        placeholder="e.g. S. CHEN"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer"
                >
                  <span>Execute RocketRide Pipeline</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STAGE 1 & 2: LOADING SKELETON */}
        {(stage === 1 || stage === 2) && (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-12 text-center space-y-4">
            <div className="h-10 w-10 mx-auto rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <div>
              <p className="text-sm font-bold text-white">
                {stage === 1
                  ? 'Correlating Multi-System Customer Signals...'
                  : 'Google Gemini (gemini-2_5-flash) Synthesizing Evidence Exhibits...'}
              </p>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                Executing {stage === 1 ? 'dispute_triage.pipe' : 'dispute_defense.pipe'} via
                RocketRide
              </p>
            </div>
          </div>
        )}

        {/* STAGE 3: EVIDENCE RESULTS & MANDATORY HUMAN REVIEW GATE */}
        {stage === 3 && evidence && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar: Win Probability & Strategy */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                  AI Defense Strategy Formulated
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{evidence.strategy}</h3>
              </div>

              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-lg shrink-0">
                <Scale className="h-4 w-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block leading-none">
                    Estimated Win Rate
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    {(evidence.winProbability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Generated Exhibits */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                Generated Exhibits ({evidence.exhibits.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {evidence.exhibits.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950 border border-neutral-800/80 p-4 rounded-xl space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-indigo-400 font-bold">Exhibit {idx + 1}</span>
                      <span className="text-neutral-500">{ex.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-200 line-clamp-1">{ex.title}</h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{ex.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebuttal Letter (Editable) */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl overflow-hidden">
              <div className="p-3 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  Legal Representment Statement ({form.processor} Format)
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 font-mono text-xs text-neutral-300">
                <textarea
                  rows={10}
                  value={editableLetter}
                  onChange={(e) => setEditableLetter(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-600 leading-relaxed"
                />
              </div>
            </div>

            {/* Mandatory Human-in-the-Loop Review Form */}
            <form
              onSubmit={handleApprove}
              className="bg-neutral-950 border border-indigo-500/30 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">
                    Mandatory Human Review Gate (HITL)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> SLA: 6 Days Remaining
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Enter Compliance Officer Name for Sign-Off:
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                    placeholder="e.g. Sarah Chen (Risk Lead)"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Verify & Transmit to {form.processor}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STAGE 4: TRANSMITTING */}
        {stage === 4 && (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-12 text-center space-y-4">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-sm font-bold text-white">
              Transmitting Approved Evidence Package to {form.processor} API...
            </p>
          </div>
        )}

        {/* STAGE 5: OUTCOME WON, REVENUE & LEARNING LOOP */}
        {stage === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Win Header */}
            <div className="bg-neutral-950 border border-emerald-500/40 rounded-xl p-6 text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Resolution Verdict
              </span>
              <h2 className="text-2xl font-black text-white">
                DISPUTE WON — ${form.amount.toFixed(2)} USD RECOVERED
              </h2>
              <p className="text-xs text-neutral-400">
                Evidence accepted by {form.processor} issuing bank. Full funds released to merchant.
              </p>
            </div>

            {/* Commercial Revenue Breakdown */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                  DisputeRocket Monetization Ledger
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Ref: {form.disputeId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
                <div>
                  <span className="text-neutral-500 block">Base Job Fee</span>
                  <span className="font-bold text-white">${flatFee.toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Contingency (15%)</span>
                  <span className="font-bold text-white">${contingencyFee.toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-indigo-400 block">Platform Revenue</span>
                  <span className="font-black text-indigo-400 text-sm">
                    ${totalRevenue.toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-emerald-400 block">Net Merchant Saved</span>
                  <span className="font-black text-emerald-400 text-sm">
                    ${netSaved.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Continual Learning Feedback */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-2 text-xs">
              <span className="text-neutral-400 font-bold block flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Outcome Learning Heuristics (dispute_learning.pipe):
              </span>
              <p className="text-neutral-300 leading-relaxed">
                ✔ Key winning factor: AVS/CVV authorization match combined with{' '}
                {form.businessType === 'SaaS'
                  ? `${form.activeHours} hours authenticated telemetry`
                  : `carrier tracking delivery signature`}
                .
              </p>
              <p className="text-neutral-400">
                Pattern stored in customer record to maximize win rates on future disputes under
                reason code "{form.reasonCode}".
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-xs transition cursor-pointer"
              >
                Process Another Dispute
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center text-[11px] text-neutral-600 font-mono">
          <span>DisputeRocket • RocketRide + Google Gemini</span>
          <span>Rocket Ride Hackathon</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
