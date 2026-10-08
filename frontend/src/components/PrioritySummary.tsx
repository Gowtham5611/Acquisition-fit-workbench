import { Stats } from '../types';

interface PrioritySummaryProps {
  stats: Stats | null;
  onFilter: (priority: string) => void;
}

export default function PrioritySummary({ stats, onFilter }: PrioritySummaryProps) {
  if (!stats) return null;

  return (
    <div className="flex flex-wrap gap-2 text-xs font-semibold">
      <button 
        type="button"
        onClick={() => onFilter('HIGH')}
        className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60 transition-colors shadow-xs"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
        {stats.high_priority} High Priority
      </button>
      
      <button 
        type="button"
        onClick={() => onFilter('MEDIUM')}
        className="inline-flex items-center px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800/60 transition-colors shadow-xs"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
        {stats.medium_priority} Medium Priority
      </button>
      
      <button 
        type="button"
        onClick={() => onFilter('LOW')}
        className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors shadow-xs"
      >
        <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
        {stats.low_priority} Low Priority
      </button>

      {stats.unscored_leads > 0 && (
        <button 
          type="button"
          onClick={() => onFilter('UNSCORED')}
          className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 transition-colors shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-slate-600 mr-2"></span>
          {stats.unscored_leads} Unscored
        </button>
      )}
    </div>
  );
}
