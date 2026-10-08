interface PriorityBadgeProps {
  priority: string | null;
  className?: string;
}

export default function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  if (!priority || priority === 'UNSCORED') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 ${className}`}>
        <span className="mr-1.5 h-2 w-2 rounded-full bg-slate-400"></span>
        Unscored
      </span>
    );
  }

  if (priority === 'HIGH') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ${className}`}>
        <svg className="mr-1.5 h-2 w-2 text-emerald-500" fill="currentColor" viewBox="0 0 8 8">
          <path d="M4 0L8 8H0L4 0Z" />
        </svg>
        High
      </span>
    );
  }

  if (priority === 'MEDIUM') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ${className}`}>
        <svg className="mr-1.5 h-2 w-2 text-amber-500" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
        Medium
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>
      <svg className="mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
        <path d="M0 0L8 0L4 8L0 0Z" />
      </svg>
      Low
    </span>
  );
}
