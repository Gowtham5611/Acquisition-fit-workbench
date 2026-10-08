import { InsightsResponse } from '../types';
import OpportunityMatrix from './OpportunityMatrix';
import ResearchQueue from './ResearchQueue';
import PipelineInsights from './PipelineInsights';
import { Target, AlertTriangle, TrendingUp, ShieldCheck, Bookmark } from 'lucide-react';

interface ExecutiveViewProps {
  insights: InsightsResponse | null;
  onSelectLead: (leadId: number) => void;
  isLoading?: boolean;
}

export default function ExecutiveView({ insights, onSelectLead, isLoading }: ExecutiveViewProps) {
  return (
    <div className="space-y-6">
      {/* Executive Insight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Priority Targets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Priority Targets
            </span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {isLoading ? '...' : insights?.priority_targets_count ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            High Fit + High Confidence
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Verify First */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Verify First
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {isLoading ? '...' : insights?.verify_first_count ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            High Fit + Low Confidence
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Avg Fit Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Avg Fit Score
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {isLoading ? '...' : `${insights?.avg_fit_score.toFixed(1) ?? '0.0'}/100`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {insights?.scored_leads ?? 0} targets evaluated
          </p>
        </div>

        {/* Avg Data Confidence */}
        <div 
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group cursor-help"
          title="Data confidence reflects completeness and validation of 11 core firmographic & contact fields; not a guarantee of factual accuracy or deal probability."
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Avg Confidence
            </span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {isLoading ? '...' : `${insights?.avg_data_confidence.toFixed(1) ?? '0.0'}%`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Profile field completeness
          </p>
        </div>

        {/* Shortlisted Targets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Shortlisted
            </span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {isLoading ? '...' : insights?.shortlisted_count ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Selected for comparison / brief
          </p>
        </div>
      </div>

      {/* Main 2-Column Visual Area: Opportunity Matrix & Today's Research Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <OpportunityMatrix
            points={insights?.matrix_points ?? []}
            onSelectLead={onSelectLead}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-5">
          <ResearchQueue
            items={insights?.research_queue ?? []}
            onSelectLead={onSelectLead}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Deterministic Pipeline Insights */}
      <PipelineInsights insights={insights?.pipeline_insights ?? []} />
    </div>
  );
}

