import React, { useEffect } from 'react';
import { Trophy, Sparkles, DollarSign, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DisputeScenario } from '../data/mockDisputes';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: DisputeScenario;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({ isOpen, onClose, scenario }) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const flatFee = 25.0;
  const contingencyFee = scenario.amount * 0.15;
  const totalRevenue = flatFee + contingencyFee;
  const netSaved = scenario.amount - totalRevenue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Win Banner */}
        <div className="text-center space-y-2 pt-2">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
            <Trophy className="h-9 w-9 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white">DISPUTE RESOLUTION: WON!</h3>
          <p className="text-xs text-emerald-300 font-semibold">
            ${scenario.amount.toFixed(2)} USD successfully recovered and returned to merchant!
          </p>
        </div>

        {/* AI Learning Feedback Loop */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Learning Feedback Loop (dispute_learning.pipe)</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-semibold text-slate-100">Telemetry Proof Accepted:</span> Issuing bank confirmed session logs and 2FA refuted unauthorized charge claim.
            </li>
            <li>
              <span className="font-semibold text-slate-100">Customer Memory Updated:</span> Lifetime win rate updated to 100%, trust index elevated to 98/100.
            </li>
            <li>
              <span className="font-semibold text-slate-100">Heuristic Stored:</span> Pattern indexed in merchant knowledge base to accelerate future defense packages.
            </li>
          </ul>
        </div>

        {/* Commercial Revenue Billing Breakdown */}
        <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 p-4 rounded-xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Commercial Monetization Ledger
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded font-mono">
              Paid Job #disp_{scenario.disputeId.slice(-4)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Base Dispute Packaging Fee:</span>
              <span className="font-mono">${flatFee.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Success Contingency (15.0% of ${scenario.amount.toFixed(2)}):</span>
              <span className="font-mono">${contingencyFee.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-indigo-300 font-bold pt-1 border-t border-indigo-500/20">
              <span>Total DisputeRocket Revenue Earned:</span>
              <span className="font-mono text-sm">${totalRevenue.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-extrabold pt-1">
              <span>Net Merchant Capital Saved:</span>
              <span className="font-mono text-sm">${netSaved.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          Close & Return to Portfolio
        </button>
      </div>
    </div>
  );
};
