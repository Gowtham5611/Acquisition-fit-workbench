import { ResearchQueueItem } from '../types';
import { Compass, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResearchQueueProps {
  items: ResearchQueueItem[];
  onSelectLead: (leadId: number) => void;
  isLoading?: boolean;
}

export default function ResearchQueue({ items, onSelectLead, isLoading }: ResearchQueueProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Today's Research Queue
          </h3>
          <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-full font-mono">
            Top Priority
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Ranked by strategic fit & data clarity
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm py-12">
          Loading priority queue...
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm py-12">
          <p>No prioritized opportunities found.</p>
          <p className="text-xs text-slate-600 mt-1">Score leads to generate your research pipeline.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3.5 transition-all duration-150 hover:shadow-md group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300">
                    #{idx + 1}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {item.company_name}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Fit {item.fit_score.toFixed(0)}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    Conf {item.data_confidence.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* WHY IT MATTERS */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-2.5">
                <span className="text-slate-400 font-semibold mr-1">WHY:</span>
                {item.why_it_matters}
              </p>

              {/* NEXT BEST ACTION & CTA */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[240px]">
                    {item.next_action}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLead(item.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors shrink-0"
                >
                  <span>View Target</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
