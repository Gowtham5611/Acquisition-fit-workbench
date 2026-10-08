import { useState, useEffect } from 'react';
import { Lead, DecisionSummary } from '../types';
import { 
  X, ExternalLink, Mail, Phone, Linkedin, CheckCircle2, 
  AlertTriangle, Star, FileText, ShieldCheck, Compass, Info 
} from 'lucide-react';
import { api } from '../services/api';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onToggleShortlist?: (leadId: number) => void;
  isShortlisted?: boolean;
  onGenerateBrief?: (leadId: number) => void;
}

export default function LeadDetailDrawer({
  lead,
  onClose,
  onToggleShortlist,
  isShortlisted = false,
  onGenerateBrief
}: LeadDetailDrawerProps) {
  const [decisionSummary, setDecisionSummary] = useState<DecisionSummary | null>(null);
  const [isLoadingDecision, setIsLoadingDecision] = useState(false);

  useEffect(() => {
    if (lead?.id) {
      setIsLoadingDecision(true);
      api.getDecisionSummary(lead.id)
        .then(data => setDecisionSummary(data))
        .catch(err => console.error('Failed to load decision summary', err))
        .finally(() => setIsLoadingDecision(false));
    } else {
      setDecisionSummary(null);
    }
  }, [lead?.id]);

  if (!lead) return null;

  const formatRevenue = (rev: number | null) => {
    if (rev === null || rev === undefined) return 'Undisclosed';
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M (${rev.toLocaleString()})`;
    if (rev >= 1000) return `$${(rev / 1000).toFixed(0)}K (${rev.toLocaleString()})`;
    return `$${rev.toLocaleString()}`;
  };

  const formatExternalUrl = (url: string | null) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const positiveReasons = lead.score_reasons?.positive || [];
  const negativeReasons = lead.score_reasons?.negative || [];
  const breakdown = lead.score_breakdown || {};

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl transform transition-transform ease-in-out duration-300">
          <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl overflow-y-auto">
            {/* Header: Company Name, Priority, Shortlist Star */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleShortlist && onToggleShortlist(lead.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isShortlisted
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
                  }`}
                  title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                >
                  <Star className={`w-4 h-4 ${isShortlisted ? 'fill-amber-400' : ''}`} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">{lead.company_name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      lead.priority === 'HIGH'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : lead.priority === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {lead.priority || 'UNSCORED'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {lead.industry || 'General Industry'} • {lead.city ? `${lead.city}, ` : ''}{lead.state || 'Location pending'}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={onClose} 
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Bar */}
            <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onGenerateBrief && onGenerateBrief(lead.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Generate Acquisition Brief
                </button>
                <button
                  type="button"
                  onClick={() => onToggleShortlist && onToggleShortlist(lead.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium border transition-colors ${
                    isShortlisted
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-400' : ''}`} />
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {lead.website && (
                  <a
                    href={formatExternalUrl(lead.website)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Open Website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {lead.linkedin_url && (
                  <a
                    href={formatExternalUrl(lead.linkedin_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Open LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Main Body */}
            <div className="p-6 space-y-6">
              {/* Primary Dual Metric Cards: Fit Score & Data Confidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-4 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Acquisition Fit Score
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold font-mono text-emerald-400">
                      {lead.fit_score !== null ? lead.fit_score.toFixed(0) : '—'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium block mt-1">
                    {lead.priority} Priority Target
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-4 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Data Confidence
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-bold font-mono text-cyan-400">
                      {(lead.data_quality_score || 0).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">
                    {decisionSummary?.quadrant_label || 'Calculated Confidence'}
                  </span>
                </div>
              </div>

              {/* WHY THIS TARGET? (Executive Summary) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Why This Target?
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isLoadingDecision ? (
                    'Generating target analysis...'
                  ) : decisionSummary?.why_this_target ? (
                    decisionSummary.why_this_target
                  ) : (
                    'Evaluation pending against configured Ideal Company Profile.'
                  )}
                </p>
              </div>

              {/* NEXT BEST ACTION */}
              <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Recommended Next Best Action
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {lead.next_best_action || decisionSummary?.next_best_action || 'Verify company data before outreach'}
                </p>
              </div>

              {/* VERIFICATION GAPS (Prioritized Checklist) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Verification Gaps (Data Quality Checklist)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {decisionSummary?.verification_gaps.length ?? 0} items
                  </span>
                </div>

                {isLoadingDecision ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Checking data completeness...</p>
                ) : !decisionSummary || decisionSummary.verification_gaps.length === 0 ? (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All core firmographic and decision-maker contact fields verified.</span>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {decisionSummary.verification_gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2.5 text-xs"
                      >
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0 uppercase ${
                            gap.priority === 'HIGH'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : gap.priority === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {gap.priority}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 block">{gap.label}</span>
                          <span className="text-[11px] text-slate-400">{gap.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TARGET SNAPSHOT */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 mb-3">
                  Target Snapshot
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Reported Revenue</span>
                    <span className="font-mono font-semibold text-slate-100">{formatRevenue(lead.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Headcount</span>
                    <span className="font-mono font-semibold text-slate-100">
                      {lead.employee_count ? `${lead.employee_count} employees` : 'Undisclosed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Operating History</span>
                    <span className="font-semibold text-slate-100">
                      {lead.founded_year ? `${new Date().getFullYear() - lead.founded_year} yrs (Est. ${lead.founded_year})` : 'Undisclosed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Geographic Location</span>
                    <span className="font-semibold text-slate-100">
                      {lead.city ? `${lead.city}, ` : ''}{lead.state || 'N/A'}, {lead.country || 'USA'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block">Decision Maker</span>
                    <span className="font-semibold text-slate-100 block">
                      {lead.owner_name ? `${lead.owner_name} ${lead.owner_title ? `(${lead.owner_title})` : ''}` : 'Unidentified'}
                    </span>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-slate-300">
                      {lead.owner_email && (
                        <a href={`mailto:${lead.owner_email}`} className="flex items-center gap-1 hover:text-indigo-400">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{lead.owner_email}</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-indigo-400">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* TECHNICAL SCORE BREAKDOWN */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 mb-3">
                  Score Factor Breakdown (100 pts)
                </h3>
                <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs">
                  {[
                    { label: 'Industry Fit', max: 25, val: breakdown.industry || 0 },
                    { label: 'Geography Fit', max: 15, val: breakdown.geography || 0 },
                    { label: 'Revenue Fit', max: 15, val: breakdown.revenue || 0 },
                    { label: 'Employee Count Fit', max: 10, val: breakdown.employees || 0 },
                    { label: 'Business Age Fit', max: 10, val: breakdown.business_age || 0 },
                    { label: 'Decision Maker Availability', max: 10, val: breakdown.decision_maker || 0 },
                    { label: 'Data Completeness', max: 10, val: breakdown.data_completeness || 0 },
                    { label: 'Website Presence', max: 5, val: breakdown.website || 0 },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{f.label} ({f.max} pts max)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${(f.val / f.max) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-slate-200 w-8 text-right">
                          {f.val.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* POSITIVE & NEGATIVE SIGNALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-2">
                    Positive Signals ({positiveReasons.length})
                  </span>
                  {positiveReasons.length === 0 ? (
                    <p className="text-slate-500 italic text-[11px]">No positive signals recorded.</p>
                  ) : (
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      {positiveReasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-2">
                    Negative / Gap Signals ({negativeReasons.length})
                  </span>
                  {negativeReasons.length === 0 ? (
                    <p className="text-slate-500 italic text-[11px]">No negative signals recorded.</p>
                  ) : (
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      {negativeReasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* SOURCE ATTRIBUTION & DISCLAIMER */}
              <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-[10px] text-slate-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Data Disclosure: </span>
                  Demo dataset for interview prototype — Synthetic data only. Source: {lead.source || 'Demo Directory'}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
