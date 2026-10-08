import { Users, TrendingUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Stats } from '../types';

interface KPICardsProps {
  stats: Stats | null;
  isLoading: boolean;
}

export default function KPICards({ stats, isLoading }: KPICardsProps) {
  const cards = [
    {
      name: 'Total Leads',
      value: stats?.total_leads || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'High Priority',
      value: stats?.high_priority || 0,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      name: 'Medium Priority',
      value: stats?.medium_priority || 0,
      icon: CheckCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      name: 'Low Priority',
      value: stats?.low_priority || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      name: 'Avg Fit Score',
      value: stats?.avg_fit_score != null ? `${Math.round(stats.avg_fit_score)}/100` : '—',
      icon: HelpCircle,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 animate-pulse">
            <div className="p-5">
              <div className="h-10 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-md ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
                  <dd>
                    <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
