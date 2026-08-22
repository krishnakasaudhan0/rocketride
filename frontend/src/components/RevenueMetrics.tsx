import React from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Award } from 'lucide-react';

interface RevenueMetricsProps {
  totalDisputes: number;
  disputesWon: number;
  totalVolume: number;
  totalRecovered: number;
  totalRevenue: number;
  netMerchantSavings: number;
}

export const RevenueMetrics: React.FC<RevenueMetricsProps> = ({
  totalDisputes,
  disputesWon,
  totalVolume,
  totalRecovered,
  totalRevenue,
  netMerchantSavings,
}) => {
  const winRate = totalDisputes > 0 ? (disputesWon / totalDisputes) * 100 : 100;
  const roiMultiplier = totalRevenue > 0 ? (totalRecovered / totalRevenue).toFixed(1) : '4.3';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Volume Defended</span>
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-black text-slate-100">
          ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {totalDisputes} Total Dispute Jobs Processed
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Capital Recovered</span>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-black text-emerald-400">
          ${totalRecovered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-emerald-400/80 mt-0.5 font-semibold">
          {winRate.toFixed(0)}% Platform Win Rate
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">DisputeRocket Revenue</span>
          <DollarSign className="h-4 w-4 text-purple-400" />
        </div>
        <p className="text-2xl font-black text-purple-400">
          ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          $25 Flat + 15% Success Contingency
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Merchant Net ROI</span>
          <Award className="h-4 w-4 text-amber-400" />
        </div>
        <p className="text-2xl font-black text-amber-400">{roiMultiplier}x ROI</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          ${netMerchantSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })} Direct Savings
        </p>
      </div>
    </div>
  );
};
