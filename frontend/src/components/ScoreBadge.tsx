interface ScoreBadgeProps {
  score: number | null;
  className?: string;
}

export default function ScoreBadge({ score, className = '' }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 ${className}`}>
        —
      </span>
    );
  }

  let colorClass = 'bg-red-500';
  if (score >= 80) {
    colorClass = 'bg-emerald-500';
  } else if (score >= 60) {
    colorClass = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold text-white shadow-sm ${colorClass} ${className}`}>
      {Math.round(score)}
    </span>
  );
}
