import { Stats } from '../types';

interface PrioritySummaryProps {
  stats: Stats | null;
  onFilter: (priority: string) => void;
}

export default function PrioritySummary({ stats, onFilter }: PrioritySummaryProps) {
  if (!stats) return null;

  return (
    <div className="flex space-x-2 text-sm font-medium">
      <button 
        onClick={() => onFilter('HIGH')}
        className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        {stats.high_priority} High
      </button>
      
      <button 
        onClick={() => onFilter('MEDIUM')}
        className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
        {stats.medium_priority} Medium
      </button>
      
      <button 
        onClick={() => onFilter('LOW')}
        className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
        {stats.low_priority} Low
      </button>

      {stats.unscored_leads > 0 && (
        <button 
          onClick={() => onFilter('UNSCORED')}
          className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
          {stats.unscored_leads} Unscored
        </button>
      )}
    </div>
  );
}
