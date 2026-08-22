import React from 'react';
import { MessageSquare, Sparkles, Send, CheckCircle2, Activity, Terminal } from 'lucide-react';

interface PipelineVisualizerProps {
  currentStage: number; // 0: Idle, 1: Aggregating, 2: AI Generating, 3: Review, 4: Submitted, 5: Won
  pipelineName: string;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  currentStage,
  pipelineName,
}) => {
  const isLlmActive = currentStage === 2;
  const isComplete = currentStage >= 3;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">
            Live RocketRide AI Pipeline DAG:{' '}
            <span className="font-mono text-indigo-400">{pipelineName}</span>
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            Lane:{' '}
            <span className="text-purple-400 font-semibold">
              {currentStage >= 2 ? 'answers' : 'questions'}
            </span>
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              currentStage === 2
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                : currentStage >= 3
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {currentStage === 1 && 'Ingesting & Correlating'}
            {currentStage === 2 && 'Gemini LLM Processing'}
            {currentStage === 3 && 'Human Review Gate'}
            {currentStage === 4 && 'Transmitted to Gateway'}
            {currentStage === 5 && 'Outcome Won & Learned'}
            {currentStage === 0 && 'Pipeline Ready'}
          </span>
        </div>
      </div>

      {/* Interactive Visual Graph Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 items-center">
        {/* Node 1: Chat Source */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            currentStage >= 1
              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Source Node
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
              chat_1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Dispute Questions</p>
              <p className="text-[11px] text-slate-400">Multi-Signal Dossier</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Out: questions</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Ready
            </span>
          </div>
        </div>

        {/* Node 2: Google Gemini LLM Engine */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 relative ${
            isLlmActive
              ? 'bg-purple-950/50 border-purple-500 shadow-xl shadow-purple-500/20 glow-active'
              : isComplete
              ? 'bg-purple-950/30 border-purple-500/40'
              : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> LLM Processor
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              gemini-2_5-flash
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Gemini LLM Node</p>
              <p className="text-[11px] text-slate-400">
                {isLlmActive ? 'Generating Legal Exhibits...' : 'Evidence Synthesis'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>In: questions</span>
            <span className="text-purple-300">Out: answers</span>
          </div>
        </div>

        {/* Node 3: Answers Response Node */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            isComplete
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Response Node
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
              response_answers_1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Send className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Legal Pack Output</p>
              <p className="text-[11px] text-slate-400">Rebuttal & Exhibits</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Lane: answers</span>
            <span className={isComplete ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {isComplete ? '100% Compiled' : 'Waiting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
