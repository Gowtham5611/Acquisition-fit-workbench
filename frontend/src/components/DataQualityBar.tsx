interface DataQualityBarProps {
  score: number | null;
}

export default function DataQualityBar({ score }: DataQualityBarProps) {
  if (score === null) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  let colorClass = 'bg-red-500';
  if (score >= 80) {
    colorClass = 'bg-emerald-500';
  } else if (score >= 60) {
    colorClass = 'bg-amber-500';
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden w-24">
        <div 
          className={`h-full ${colorClass}`} 
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600">{Math.round(score)}%</span>
    </div>
  );
}
