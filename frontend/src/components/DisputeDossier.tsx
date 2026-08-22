import React, { useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  Laptop,
  Truck,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import type { DisputeScenario } from '../data/mockDisputes';

interface DisputeDossierProps {
  scenario: DisputeScenario;
}

export const DisputeDossier: React.FC<DisputeDossierProps> = ({ scenario }) => {
  const [activeTab, setActiveTab] = useState<'alert' | 'order' | 'telemetry' | 'customer'>('alert');

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Multi-System Customer Dossier</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({scenario.disputeId})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-correlated across 5 disparate data sources before AI synthesis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>SLA: {scenario.hoursRemaining}h remaining</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('alert')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'alert'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Dispute Alert</span>
        </button>

        <button
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'order'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Order & AVS/CVV</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'telemetry'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {scenario.businessType === 'SaaS' ? (
            <>
              <Laptop className="h-3.5 w-3.5" />
              <span>Session Telemetry (2FA)</span>
            </>
          ) : (
            <>
              <Truck className="h-3.5 w-3.5" />
              <span>Delivery & GPS Proof</span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
            activeTab === 'customer'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Customer Memory</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4 text-xs">
        {activeTab === 'alert' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Processor / Gateway</span>
                <span className="font-bold text-slate-200 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {scenario.processor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disputed Amount</span>
                <span className="font-black text-rose-400 text-sm">
                  ${scenario.amount.toFixed(2)} {scenario.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reason Code</span>
                <span className="font-mono font-bold text-amber-400">
                  {scenario.reasonCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref</span>
                <span className="font-mono text-slate-300">{scenario.transactionId}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block font-semibold">Gateway Reason Claim:</span>
              <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 italic">
                "{scenario.reasonDescription}"
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Eligible for Representment Defense</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'order' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Purchased Item</span>
                <span className="font-semibold text-slate-200">{scenario.order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Timestamp</span>
                <span className="text-slate-300">{scenario.order.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Card</span>
                <span className="font-mono text-slate-200">
                  {scenario.order.cardBrand} *{scenario.order.cardLast4}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Checkout IP</span>
                <span className="font-mono text-slate-300">{scenario.order.ipAddress}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AVS Match (Address & Zip)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> FULL MATCH
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CVV2 Verification</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> PASS / MATCHED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Terms & Conditions Consent</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> AFFIRMATIVE
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Billing: <span className="text-slate-300">{scenario.order.billingAddress}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div>
            {scenario.telemetry ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Active Hours Logged</span>
                    <span className="font-bold text-indigo-400 text-sm">
                      {scenario.telemetry.activeHours} Hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">API Calls Executed</span>
                    <span className="font-mono text-slate-200">
                      {scenario.telemetry.apiCallsCount.toLocaleString()} Requests
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2-Factor Authentication</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED 2FA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Active Session</span>
                    <span className="text-slate-300">{scenario.telemetry.lastActiveDate}</span>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block font-semibold mb-1">
                    Features Actively Utilized Post-Purchase:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scenario.telemetry.featuresUsed.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono"
                      >
                        ✔ {f}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 text-[11px] text-slate-400 font-mono">
                    Device Fingerprint:{' '}
                    <span className="text-slate-300">{scenario.telemetry.deviceFingerprint}</span>
                  </div>
                </div>
              </div>
            ) : scenario.delivery ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carrier Service</span>
                    <span className="font-bold text-slate-200">{scenario.delivery.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tracking Number</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {scenario.delivery.trackingNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fulfillment Status</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {scenario.delivery.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivered On</span>
                    <span className="text-slate-300">{scenario.delivery.deliveredDate}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient Signature</span>
                    <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      "{scenario.delivery.signedBy}"
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-rose-400" /> GPS Lat/Lng
                    </span>
                    <span className="font-mono text-slate-200">
                      {scenario.delivery.gpsCoordinates}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                    ✔ Carrier GPS coordinates match the verified cardholder delivery address within 5m.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'customer' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-slate-400 block mb-1">Lifetime Orders & Spend</span>
              <p className="text-lg font-black text-slate-100">
                {scenario.customerHistory.lifetimeOrders} Orders
              </p>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                ${scenario.customerHistory.lifetimeSpend.toFixed(2)} USD
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-slate-400 block mb-1">Past Dispute History</span>
              <p className="text-lg font-black text-indigo-400">
                {scenario.customerHistory.pastDisputesWon} Won /{' '}
                {scenario.customerHistory.pastDisputesLost} Lost
              </p>
              <p className="text-xs text-slate-400 mt-0.5">100% Reversal Record</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-slate-400 block mb-1">Customer Trust Score</span>
              <p className="text-lg font-black text-emerald-400">
                {scenario.customerHistory.trustScore}/100
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Verified Identity</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
