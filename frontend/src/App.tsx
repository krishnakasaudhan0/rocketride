import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  Copy,
  Check,
  Scale,
  Plus,
  RefreshCw,
  X,
  Radio,
  FileCode,
  Laptop,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TelemetrySignal {
  id: string;
  source: string;
  usageHours: number;
  twoFactorUsed: boolean;
  avsMatch: boolean;
  cvvMatch: boolean;
  sessionCount: number;
  fetchedAt: string;
}

interface DisputeItem {
  id: string;
  processor: string;
  externalDisputeId: string;
  chargeId: string;
  amountCents: number;
  currency: string;
  reasonRaw: string;
  reasonCanonical: string;
  customerName?: string;
  customerEmail?: string;
  cardLast4?: string;
  businessType?: string;
  status: 'INGESTED' | 'ENRICHED' | 'SCORED' | 'DRAFTED' | 'NEEDS_REVIEW' | 'SUBMITTED';
  evidenceDueBy: string;
  evidenceScore?: number;
  rebuttalDraft?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  amountFormatted?: string;
  hoursRemaining?: number;
  isUrgent?: boolean;
  telemetrySignals?: TelemetrySignal[];
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('disputerocket_token') : null;
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    disputeId: '',
    customerName: 'Alexander Vance',
    customerEmail: 'alex.vance@company.io',
    amount: 450.0,
    currency: 'USD',
    processor: 'Stripe',
    reasonCode: '10.4_FRAUD_CARD_ABSENT',
    cardLast4: '8819',
    businessType: 'SaaS',
    activeHours: 38.5,
    twoFactorVerified: true,
    avsMatch: true,
    cvvMatch: true,
  });

  // Check auth session
  const checkAuth = async () => {
    try {
      const res = await authFetch(`${API_BASE}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('disputerocket_token');
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch disputes from backend
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/disputes`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data);
        if (data.length > 0) {
          if (!selectedDispute) {
            setSelectedDispute(data[0]);
          } else {
            const updated = data.find((d: DisputeItem) => d.id === selectedDispute.id);
            if (updated) setSelectedDispute(updated);
            else setSelectedDispute(data[0]);
          }
        } else {
          setSelectedDispute(null);
        }
      }
    } catch {
      // Offline fallback seed for standalone preview if backend unreachable
      if (disputes.length === 0) {
        setDisputes([
          {
            id: 'demo_1',
            processor: 'stripe',
            externalDisputeId: 'dp_stripe_live_7719',
            chargeId: 'ch_live_881902',
            amountCents: 45000,
            currency: 'USD',
            reasonRaw: 'fraudulent',
            reasonCanonical: 'FRAUD',
            customerName: 'Alexander Vance',
            customerEmail: 'alex.vance@vancemedia.io',
            cardLast4: '8819',
            businessType: 'SaaS',
            status: 'DRAFTED',
            evidenceDueBy: new Date(Date.now() + 6 * 86400 * 1000).toISOString(),
            evidenceScore: 100,
            rebuttalDraft: `REPRESENTMENT REBUTTAL STATEMENT\nTo: STRIPE Dispute Resolution & Card Issuing Bank\nDispute Reference: dp_stripe_live_7719 | Amount: $450.00 USD\nReason: fraudulent (FRAUD) | Cardholder: Alexander Vance\n\nWe provide conclusive evidence refuting the claim of unauthorized transaction. The purchase was authenticated with full AVS & CVV match on Visa *8819. Server telemetry records 38.5 active usage hours across 14 authenticated sessions with 2-Factor Authentication verified on the cardholder's primary device.\n\nWe respectfully request immediate reversal of this dispute.`,
            createdAt: new Date().toISOString(),
            amountFormatted: '$450.00 USD',
            hoursRemaining: 138,
            isUrgent: false,
            telemetrySignals: [
              {
                id: 'sig_1',
                source: 'mock_analytics_db',
                usageHours: 38.5,
                twoFactorUsed: true,
                avsMatch: true,
                cvvMatch: true,
                sessionCount: 14,
                fetchedAt: new Date().toISOString(),
              },
            ],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchDisputes();
    const interval = setInterval(fetchDisputes, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle Login & Register submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const body =
        authMode === 'register'
          ? { email: authEmail, password: authPassword, name: authName }
          : { email: authEmail, password: authPassword };

      const res = await authFetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      if (data.token) {
        localStorage.setItem('disputerocket_token', data.token);
      }

      setCurrentUser(data.user);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      setAuthError(err.message || 'Connection error with backend server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authFetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
      });
    } catch {}
    localStorage.removeItem('disputerocket_token');
    setCurrentUser(null);
  };

  // Trigger Ingestion Simulator
  const triggerStripeWebhook = async (type: 'high_saas' | 'high_ecom' | 'low_evidence') => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    let payload;

    if (type === 'high_saas') {
      payload = {
        disputeId: `dp_saas_${rand}`,
        customerName: 'Alexander Vance',
        customerEmail: 'alex.vance@vancemedia.io',
        amount: 450.0,
        currency: 'USD',
        processor: 'Stripe',
        reasonCode: '10.4_FRAUD_CARD_ABSENT',
        cardLast4: '8819',
        businessType: 'SaaS',
        activeHours: 38.5,
        twoFactorVerified: true,
        avsMatch: true,
        cvvMatch: true,
      };
    } else if (type === 'high_ecom') {
      payload = {
        disputeId: `dp_ecom_${rand}`,
        customerName: 'Sarah Chen',
        customerEmail: 'sarah.chen@studioaudio.com',
        amount: 899.0,
        currency: 'USD',
        processor: 'Shopify',
        reasonCode: '13.1_MERCHANDISE_NOT_RECEIVED',
        cardLast4: '1092',
        businessType: 'E-Commerce',
        activeHours: 0,
        twoFactorVerified: false,
        avsMatch: true,
        cvvMatch: true,
      };
    } else {
      payload = {
        disputeId: `dp_fraud_${rand}`,
        customerName: 'Suspicious Buyer',
        customerEmail: 'fraud_account@disposable.com',
        amount: 1200.0,
        currency: 'USD',
        processor: 'Stripe',
        reasonCode: '10.4_FRAUD_CARD_ABSENT',
        cardLast4: '0000',
        businessType: 'SaaS',
        activeHours: 0.1,
        twoFactorVerified: false,
        avsMatch: false,
        cvvMatch: false,
      };
    }

    try {
      const res = await authFetch(`${API_BASE}/api/disputes/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchDisputes();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error ingesting dispute: ${errData.error || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Error communicating with backend server: ${err.message}`);
    }
  };

  // Submit Manual Dispute
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/api/disputes/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm),
      });
      if (res.ok) {
        setIsManualModalOpen(false);
        fetchDisputes();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error creating manual dispute: ${errData.error || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Backend server error: ${err.message}`);
    }
  };

  // Human Sign-Off
  const handleApproveDispute = async (id: string) => {
    setSubmittingReview(true);
    try {
      const res = await authFetch(`${API_BASE}/api/disputes/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: 'Verified AVS/CVV matching, 2FA logs, and user telemetry. Approved.',
        }),
      });
      if (res.ok) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#ffffff'],
        });
        fetchDisputes();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error approving dispute: ${errData.error || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Session Check Loader
  if (authChecking) {
    return (
      <div className="min-h-screen bg-black text-neutral-400 flex flex-col items-center justify-center font-mono text-xs gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
        <span>Verifying DisputeRocket session...</span>
      </div>
    );
  }

  // Functional Login / Register Screen if unauthenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-neutral-800">
        <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">DisputeRocket</h1>
              <p className="text-xs text-neutral-400 font-mono">Autonomous Dispute Defense Platform</p>
            </div>
          </div>

          <div className="flex border-b border-neutral-800 pb-1">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition cursor-pointer ${
                authMode === 'login'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition cursor-pointer ${
                authMode === 'register'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {authLoading
                ? 'Authenticating...'
                : authMode === 'register'
                ? 'Create Reviewer Account'
                : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-white flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-neutral-800 bg-black/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">DisputeRocket</span>
            <span className="text-[11px] text-neutral-500 font-mono">/ Operations</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Receiver Active</span>
            </div>

            {/* Signed-in user & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800 text-xs">
              <span className="hidden md:inline text-neutral-400 font-mono text-[11px]">
                Signed in as <strong className="text-neutral-200">{currentUser.name || currentUser.email}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-white px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manual Override</span>
            </button>

            <button
              onClick={fetchDisputes}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Real-time Ingestion Webhook Trigger Simulator Bar */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Stripe Webhook Intake Simulator</span>
            </h2>
            <p className="text-[11px] text-neutral-500 font-mono">
              Simulate signed Stripe webhook traffic (<code className="text-neutral-400">charge.dispute.created</code>) to test ingestion, enrichment, & scoring:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerStripeWebhook('high_saas')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-indigo-500/50 text-[11px] font-mono text-neutral-200 transition cursor-pointer"
            >
              ⚡ High-Score SaaS ($450)
            </button>
            <button
              onClick={() => triggerStripeWebhook('high_ecom')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-indigo-500/50 text-[11px] font-mono text-neutral-200 transition cursor-pointer"
            >
              📦 E-Com Delivery ($899)
            </button>
            <button
              onClick={() => triggerStripeWebhook('low_evidence')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-rose-500/50 text-[11px] font-mono text-rose-400 transition cursor-pointer"
            >
              ⚠️ Low Score ($1,200)
            </button>
          </div>
        </div>

        {/* Live Operations Queue Table */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Dispute Operations Queue
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {disputes.length} Active Records
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              Auto-Refreshes on Ingestion
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-black text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <th className="p-3">Dispute ID</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Evidence Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {disputes.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDispute(d)}
                    className="hover:bg-neutral-900/50 transition cursor-pointer group"
                  >
                    <td className="p-3 font-bold text-indigo-400 group-hover:text-indigo-300">
                      {d.externalDisputeId}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-neutral-300 border border-neutral-800">
                        {d.reasonCanonical}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <div>{d.customerName || 'Valued Customer'}</div>
                      <div className="text-[10px] text-neutral-500">{d.customerEmail}</div>
                    </td>
                    <td className="p-3 font-bold text-white">
                      ${(d.amountCents / 100).toFixed(2)} {d.currency}
                    </td>
                    <td className="p-3">
                      {d.evidenceScore !== null && d.evidenceScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              d.evidenceScore >= 50 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {d.evidenceScore}/100
                          </span>
                          <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                d.evidenceScore >= 50 ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${d.evidenceScore}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-600">Pending</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          d.status === 'DRAFTED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : d.status === 'NEEDS_REVIEW'
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            : d.status === 'SUBMITTED'
                            ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-neutral-500" />
                      <span>{d.hoursRemaining ?? 120}h left</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDispute(d);
                        }}
                        className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-4"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Dispute Detail Panel / Inspection Drawer */}
        {selectedDispute && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                  Dispute Case Dossier
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedDispute.externalDisputeId} — ${(selectedDispute.amountCents / 100).toFixed(2)} {selectedDispute.currency}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                    selectedDispute.status === 'DRAFTED'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : selectedDispute.status === 'NEEDS_REVIEW'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                      : selectedDispute.status === 'SUBMITTED'
                      ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}
                >
                  Status: {selectedDispute.status}
                </span>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Grid Breakdown: Stage 4 Telemetry Signals & Stage 5 Evidence Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Telemetry Signals */}
              <div className="bg-black border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <span className="text-neutral-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-indigo-400" />
                  Stage 4: Telemetry Signals (Mock Analytics CRM)
                </span>

                {selectedDispute.telemetrySignals && selectedDispute.telemetrySignals.length > 0 ? (
                  <div className="space-y-2 text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Active Usage Hours:</span>
                      <span className="font-bold text-white">
                        {selectedDispute.telemetrySignals[0].usageHours ?? 0} hrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">2-Factor Authentication:</span>
                      <span className={selectedDispute.telemetrySignals[0].twoFactorUsed ? 'text-emerald-400' : 'text-rose-400'}>
                        {selectedDispute.telemetrySignals[0].twoFactorUsed ? '✔ VERIFIED' : '✖ NOT USED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">AVS Address Match:</span>
                      <span className={selectedDispute.telemetrySignals[0].avsMatch ? 'text-emerald-400' : 'text-rose-400'}>
                        {selectedDispute.telemetrySignals[0].avsMatch ? '✔ PASS' : '✖ NO MATCH'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">CVV Security Check:</span>
                      <span className={selectedDispute.telemetrySignals[0].cvvMatch ? 'text-emerald-400' : 'text-rose-400'}>
                        {selectedDispute.telemetrySignals[0].cvvMatch ? '✔ PASS' : '✖ NO MATCH'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Authenticated Sessions:</span>
                      <span className="text-white">
                        {selectedDispute.telemetrySignals[0].sessionCount ?? 1} sessions
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-500">Enriching telemetry signals...</p>
                )}
              </div>

              {/* Right: Stage 5 Evidence Strength Scoring Engine */}
              <div className="bg-black border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <span className="text-neutral-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-emerald-400" />
                  Stage 5: Deterministic Evidence Score
                </span>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xl font-black text-white">
                    {selectedDispute.evidenceScore ?? 0}
                    <span className="text-sm font-normal text-neutral-500"> / 100</span>
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      (selectedDispute.evidenceScore ?? 0) >= 50
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {(selectedDispute.evidenceScore ?? 0) >= 50
                      ? 'HIGH STRENGTH (≥ 50)'
                      : 'LOW STRENGTH (< 50)'}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {(selectedDispute.evidenceScore ?? 0) >= 50
                    ? '✔ Score meets confidence threshold (≥ 50). Google Gemini auto-drafted legal representment package.'
                    : '⚠️ Low confidence score (< 50). Flagged for human-in-the-loop review before drafting weak rebuttals.'}
                </p>
              </div>
            </div>

            {/* Stage 6: Generated Rebuttal Draft */}
            {selectedDispute.rebuttalDraft && (
              <div className="bg-black border border-neutral-800 rounded-xl overflow-hidden font-mono text-xs">
                <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                    Stage 6: Gemini 2.5 Flash Representment Statement
                  </span>
                  <button
                    onClick={() => handleCopy(selectedDispute.rebuttalDraft!)}
                    className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 max-h-56 overflow-y-auto text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {selectedDispute.rebuttalDraft}
                </div>
              </div>
            )}

            {/* Human Sign-Off / Approval Action Bar */}
            {selectedDispute.status !== 'SUBMITTED' ? (
              <div className="bg-neutral-900/60 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-400" />
                    Human Reviewer Sign-Off Gate
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Reviewer certification before transmitting representment package to {selectedDispute.processor} API.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-neutral-300 text-xs">
                    Signing as: <strong className="text-white">{currentUser?.name || currentUser?.email}</strong>
                  </span>
                  <button
                    onClick={() => handleApproveDispute(selectedDispute.id)}
                    disabled={submittingReview}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold transition cursor-pointer shrink-0"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Sign Off & Submit'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between font-mono text-xs text-emerald-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Successfully Submitted to {selectedDispute.processor} API! (Signed by {selectedDispute.reviewedBy || 'Reviewer'})
                </span>
                <span className="text-[11px] text-neutral-400">Status: SUBMITTED</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Manual Override Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-indigo-400" />
                Manual Override Input Path
              </span>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 mb-1">Customer Name:</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Customer Email:</label>
                  <input
                    type="email"
                    required
                    value={manualForm.customerEmail}
                    onChange={(e) => setManualForm({ ...manualForm, customerEmail: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-500 mb-1">Amount ($ USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Card Last 4:</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={manualForm.cardLast4}
                    onChange={(e) => setManualForm({ ...manualForm, cardLast4: e.target.value })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Active Hours:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualForm.activeHours}
                    onChange={(e) => setManualForm({ ...manualForm, activeHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualForm.twoFactorVerified}
                    onChange={(e) => setManualForm({ ...manualForm, twoFactorVerified: e.target.checked })}
                    className="rounded bg-black border-neutral-700 text-indigo-500"
                  />
                  <span>2FA Verified</span>
                </label>

                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualForm.avsMatch}
                    onChange={(e) => setManualForm({ ...manualForm, avsMatch: e.target.checked })}
                    className="rounded bg-black border-neutral-700 text-indigo-500"
                  />
                  <span>AVS & CVV Match</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-bold"
                >
                  Ingest & Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 py-3 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-[10px] text-neutral-600 font-mono">
          <span>DisputeRocket • Ingestion, Telemetry Enrichment & Evidence Scoring Pipeline</span>
          <span>Rocket Ride Hackathon</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
