import React, { useState } from 'react';
import { UserCheck, Clock, ShieldCheck, X, Check } from 'lucide-react';
import type { DisputeScenario } from '../data/mockDisputes';

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: DisputeScenario;
  onApprove: (reviewerName: string, notes: string) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onApprove,
}) => {
  const [reviewerName, setReviewerName] = useState('Sarah Chen (Lead Risk & Compliance Officer)');
  const [notes, setNotes] = useState(
    'Verified AVS/CVV matching, user telemetry audit logs, and terms of service acceptance. All exhibits confirmed accurate for issuing bank.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;
    onApprove(reviewerName, notes);
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

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Human Reviewer Verification & Sign-Off
            </h3>
            <p className="text-xs text-slate-400">
              Mandatory review step before payment processor transmission
            </p>
          </div>
        </div>

        {/* SLA & Dispute Summary */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Dispute Reference:</span>
            <span className="font-mono font-bold text-indigo-400">{scenario.disputeId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount & Gateway:</span>
            <span className="font-semibold text-slate-200">
              ${scenario.amount.toFixed(2)} USD via {scenario.processor}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Filing Deadline SLA:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {scenario.hoursRemaining} Hours Remaining
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reviewer Name & Title:
            </label>
            <input
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Marcus Thorne (Compliance Officer)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audit Verification Notes:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              placeholder="Verification notes..."
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>
              By signing off, you certify this evidence pack meets processor representment standards.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Verify & Sign Off</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
