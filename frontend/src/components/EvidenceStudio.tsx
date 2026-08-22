import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Edit3,
  Scale,
  UserCheck,
} from 'lucide-react';
import type { DisputeScenario } from '../data/mockDisputes';

interface EvidenceStudioProps {
  scenario: DisputeScenario;
  onOpenReviewModal: () => void;
  isReviewed: boolean;
  isSubmitted: boolean;
  reviewedBy?: string;
}

export const EvidenceStudio: React.FC<EvidenceStudioProps> = ({
  scenario,
  onOpenReviewModal,
  isReviewed,
  isSubmitted,
  reviewedBy,
}) => {
  const [rebuttalText, setRebuttalText] = useState(scenario.aiAnalysis.rebuttalLetter);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rebuttalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>AI Evidence Packaging Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compiled by Google Gemini (gemini-2_5-flash) via RocketRide
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <Scale className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                Win Probability
              </span>
              <span className="text-sm font-black text-emerald-400">
                {(scenario.aiAnalysis.winProbability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Exhibits Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-indigo-400" />
          <span>Compiled Evidentiary Exhibits ({scenario.aiAnalysis.exhibits.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenario.aiAnalysis.exhibits.map((ex, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  {ex.number}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {ex.category}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition line-clamp-1 mb-1">
                {ex.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                {ex.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Representment Rebuttal Statement */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800/90 overflow-hidden">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">
              Payment Processor Rebuttal Statement (Legal Draft)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <Edit3 className="h-3 w-3" />
              <span>{isEditing ? 'Save Edits' : 'Edit Text'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 transition cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy Letter'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-64 overflow-y-auto">
          {isEditing ? (
            <textarea
              value={rebuttalText}
              onChange={(e) => setRebuttalText(e.target.value)}
              className="w-full h-56 bg-slate-900 text-slate-200 p-3 rounded-lg border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300">
              {rebuttalText}
            </pre>
          )}
        </div>
      </div>

      {/* Human In The Loop Call-To-Action Banner */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 p-4 rounded-xl border border-indigo-500/30">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-100">
              Mandatory Human-in-the-Loop Review Gate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isReviewed
              ? `Verified & Signed off by ${reviewedBy || 'Compliance Officer'}`
              : 'A human checks before every submission to ensure legal compliance.'}
          </p>
        </div>

        <div>
          {!isReviewed ? (
            <button
              onClick={onOpenReviewModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Review & Sign Off Now</span>
            </button>
          ) : isSubmitted ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Transmitted to {scenario.processor} Gateway</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold text-xs">
              <CheckCircle className="h-4 w-4 text-indigo-400" />
              <span>Approved & Submitting...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
