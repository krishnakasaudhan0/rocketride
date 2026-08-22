import { useState } from 'react';
import { RotateCcw, Layers } from 'lucide-react';
import { PRESET_SCENARIOS } from './data/mockDisputes';
import type { DisputeScenario } from './data/mockDisputes';
import { Navbar } from './components/Navbar';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { DisputeDossier } from './components/DisputeDossier';
import { EvidenceStudio } from './components/EvidenceStudio';
import { HumanReviewModal } from './components/HumanReviewModal';
import { OutcomeModal } from './components/OutcomeModal';
import { RevenueMetrics } from './components/RevenueMetrics';
import { CustomDisputeModal } from './components/CustomDisputeModal';

export function App() {
  const [scenarios, setScenarios] = useState<DisputeScenario[]>(PRESET_SCENARIOS);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  // Workflow Stages: 1: Ingested, 2: AI Generating, 3: Review Ready, 4: Submitted, 5: Won
  const [currentStage, setCurrentStage] = useState(3);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const [reviewedBy, setReviewedBy] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Financial Portfolio State
  const [totalDisputes, setTotalDisputes] = useState(2);
  const [disputesWon, setDisputesWon] = useState(2);
  const [totalVolume, setTotalVolume] = useState(1349.0);
  const [totalRecovered, setTotalRecovered] = useState(1349.0);
  const [totalRevenue, setTotalRevenue] = useState(252.35);
  const [netMerchantSavings, setNetMerchantSavings] = useState(1096.65);

  const currentScenario = scenarios[selectedScenarioIndex] || PRESET_SCENARIOS[0];

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setCurrentStage(3); // Ready for human review
    setReviewedBy(undefined);
    setIsSubmitted(false);
  };

  const handleAddCustomDispute = (customScenario: DisputeScenario) => {
    setScenarios([customScenario, ...scenarios]);
    setSelectedScenarioIndex(0);
    setCurrentStage(3);
    setReviewedBy(undefined);
    setIsSubmitted(false);
  };

  const handleSimulateAiRegen = () => {
    setCurrentStage(2); // AI Processing
    setTimeout(() => {
      setCurrentStage(3); // Ready for review
    }, 1500);
  };

  const handleApproveReview = (reviewer: string) => {
    setReviewedBy(reviewer);
    setIsReviewModalOpen(false);
    setCurrentStage(4); // Submitted
    setIsSubmitted(true);

    // Auto trigger submission and outcome winning
    setTimeout(() => {
      setCurrentStage(5); // Won
      setIsOutcomeModalOpen(true);

      // Update Financial Metrics
      const flatFee = 25.0;
      const contingency = currentScenario.amount * 0.15;
      const newRev = flatFee + contingency;

      setTotalDisputes((prev) => prev + 1);
      setDisputesWon((prev) => prev + 1);
      setTotalVolume((prev) => prev + currentScenario.amount);
      setTotalRecovered((prev) => prev + currentScenario.amount);
      setTotalRevenue((prev) => prev + newRev);
      setNetMerchantSavings((prev) => prev + (currentScenario.amount - newRev));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar onOpenCustomModal={() => setIsCustomModalOpen(true)} activeStage={currentStage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        {/* Scenario Switcher & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Scenarios:</span>
            </span>
            {scenarios.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-2 cursor-pointer ${
                  selectedScenarioIndex === idx
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{sc.businessType === 'SaaS' ? '💻' : '📦'}</span>
                <span>{sc.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateAiRegen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
              <span>Re-run Gemini Pipeline</span>
            </button>
          </div>
        </div>

        {/* Live RocketRide Pipeline Visualizer */}
        <PipelineVisualizer
          currentStage={currentStage}
          pipelineName="dispute_defense.pipe"
        />

        {/* Multi-System Signals & AI Evidence Packaging Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Multi-Source Customer Dossier */}
          <DisputeDossier scenario={currentScenario} />

          {/* Right Column: AI Evidence Packaging Studio */}
          <EvidenceStudio
            scenario={currentScenario}
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
            isReviewed={Boolean(reviewedBy)}
            isSubmitted={isSubmitted}
            reviewedBy={reviewedBy}
          />
        </div>

        {/* Commercial Revenue & ROI Financial Ledger */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Merchant Portfolio Economics & Revenue Billing Ledger</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Pricing: $25 Base Job Fee + 15% Success Contingency
            </span>
          </div>
          <RevenueMetrics
            totalDisputes={totalDisputes}
            disputesWon={disputesWon}
            totalVolume={totalVolume}
            totalRecovered={totalRecovered}
            totalRevenue={totalRevenue}
            netMerchantSavings={netMerchantSavings}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          <p>
            DisputeRocket • Rocket Ride Hackathon Project • Powered by RocketRide AI Pipelines &
            Google Gemini LLM Engine
          </p>
        </div>
      </footer>

      {/* Modals */}
      <HumanReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        scenario={currentScenario}
        onApprove={handleApproveReview}
      />

      <OutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        scenario={currentScenario}
      />

      <CustomDisputeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateDispute={handleAddCustomDispute}
      />
    </div>
  );
}

export default App;
