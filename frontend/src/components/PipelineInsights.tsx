import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface PipelineInsightsProps {
  insights: string[];
}

export default function PipelineInsights({ insights }: PipelineInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Deterministic Pipeline Insights
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Computed from active dataset metrics (Zero LLM / Zero hallucination)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800/70 rounded-lg p-3 text-xs text-slate-300 leading-relaxed"
          >
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
