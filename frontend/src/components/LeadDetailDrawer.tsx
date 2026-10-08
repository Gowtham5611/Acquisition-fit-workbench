import { Lead } from '../types';
import { X, ExternalLink, Mail, Phone, Linkedin, CheckCircle, AlertTriangle, Building, User, Target, BarChart2 } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import PriorityBadge from './PriorityBadge';
import DataQualityBar from './DataQualityBar';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetailDrawer({ lead, onClose }: LeadDetailDrawerProps) {
  if (!lead) return null;

  const formatRevenue = (rev: number | null) => {
    if (rev === null || rev === undefined) return '—';
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M (${rev.toLocaleString()})`;
    if (rev >= 1000) return `$${(rev / 1000).toFixed(0)}K (${rev.toLocaleString()})`;
    return `$${rev.toLocaleString()}`;
  };

  const formatExternalUrl = (url: string | null) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const getMissingFields = () => {
    const fields = [
      { key: 'industry', label: 'Industry' },
      { key: 'revenue', label: 'Revenue' },
      { key: 'employee_count', label: 'Employee Count' },
      { key: 'owner_name', label: 'Decision Maker' },
      { key: 'owner_email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'linkedin_url', label: 'LinkedIn' },
      { key: 'website', label: 'Website' },
      { key: 'state', label: 'Location' }
    ];
    return fields.filter(f => !lead[f.key as keyof Lead]).map(f => f.label);
  };

  const missingFields = getMissingFields();
  const positiveReasons = lead.score_reasons?.positive || [];
  const negativeReasons = lead.score_reasons?.negative || [];

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg transform transition-transform ease-in-out duration-300">
          <div className="h-full flex flex-col bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Target Profile</span>
                <h2 className="text-lg font-bold text-slate-900">{lead.company_name}</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Acquisition Fit Overview */}
              <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Acquisition Fit</h3>
                  </div>
                  <PriorityBadge priority={lead.priority} />
                </div>

                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">{lead.fit_score ?? '—'}</span>
                  <span className="text-sm text-slate-500 font-medium">/ 100 Points</span>
                  <div className="ml-auto">
                    <ScoreBadge score={lead.fit_score} className="text-sm px-2.5 py-0.5" />
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                {lead.score_breakdown && Object.keys(lead.score_breakdown).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                      Criterion Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(lead.score_breakdown).map(([key, value]) => (
                        <div key={key} className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                          <span className="text-slate-600 capitalize">{key.replace('_', ' ')}</span>
                          <span className="font-bold text-slate-900">{value} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signals */}
                {(positiveReasons.length > 0 || negativeReasons.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Signals & Evidence</h4>
                    
                    {positiveReasons.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-emerald-700 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Positive Signals:
                        </div>
                        {positiveReasons.map((reason, i) => (
                          <div key={i} className="text-xs text-slate-700 pl-4 flex items-start">
                            <span className="text-emerald-500 mr-1.5">✓</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {negativeReasons.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-xs font-medium text-amber-700 flex items-center">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Negative / Missing Signals:
                        </div>
                        {negativeReasons.map((reason, i) => (
                          <div key={i} className="text-xs text-slate-700 pl-4 flex items-start">
                            <span className="text-amber-500 mr-1.5">⚠</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!lead.fit_score && (
                  <p className="text-xs text-slate-500 italic mt-2">
                    Score this company by adjusting your Ideal Company Profile in the dashboard and clicking "Score Leads".
                  </p>
                )}
              </section>

              {/* Company Overview */}
              <section>
                <div className="flex items-center space-x-2 mb-3">
                  <Building className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company Overview</h3>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-2 gap-3.5 text-sm">
                  <div>
                    <span className="block text-xs text-slate-500">Website</span>
                    {lead.website ? (
                      <a 
                        href={formatExternalUrl(lead.website)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-xs break-all mt-0.5"
                      >
                        {lead.website} <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Domain</span>
                    <span className="font-medium text-slate-900 text-xs">{lead.domain || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Industry</span>
                    <span className="font-medium text-slate-900">{lead.industry || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Location</span>
                    <span className="font-medium text-slate-900">
                      {[lead.city, lead.state, lead.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Revenue</span>
                    <span className="font-medium text-slate-900">{formatRevenue(lead.revenue)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Employees</span>
                    <span className="font-medium text-slate-900">
                      {lead.employee_count ? `${lead.employee_count} FTE` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Founded Year</span>
                    <span className="font-medium text-slate-900">{lead.founded_year || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Business Age</span>
                    <span className="font-medium text-slate-900">
                      {lead.founded_year ? `${new Date().getFullYear() - lead.founded_year} years` : '—'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Decision Maker */}
              <section>
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Decision Maker</h3>
                </div>
                {lead.owner_name ? (
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="font-semibold text-slate-900 text-base">{lead.owner_name}</div>
                    <div className="text-xs text-slate-500 mb-3">{lead.owner_title || 'Executive / Owner'}</div>
                    <div className="space-y-2 text-xs">
                      {lead.owner_email ? (
                        <a href={`mailto:${lead.owner_email}`} className="flex items-center text-blue-600 hover:underline">
                          <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" /> {lead.owner_email}
                        </a>
                      ) : (
                        <div className="flex items-center text-slate-400">
                          <Mail className="h-3.5 w-3.5 mr-2 text-slate-300" /> Email not available
                        </div>
                      )}
                      {lead.phone ? (
                        <div className="flex items-center text-slate-700">
                          <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" /> {lead.phone}
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400">
                          <Phone className="h-3.5 w-3.5 mr-2 text-slate-300" /> Phone not available
                        </div>
                      )}
                      {lead.linkedin_url ? (
                        <a 
                          href={formatExternalUrl(lead.linkedin_url)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <Linkedin className="h-3.5 w-3.5 mr-2 text-slate-400" /> LinkedIn Profile
                        </a>
                      ) : (
                        <div className="flex items-center text-slate-400">
                          <Linkedin className="h-3.5 w-3.5 mr-2 text-slate-300" /> LinkedIn not available
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 italic">
                    No decision maker identified for this target yet. Consider enrichment.
                  </div>
                )}
              </section>

              {/* Data Quality & Source */}
              <section>
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart2 className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Data Quality & Lineage</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500">Completeness Score</span>
                      <span className="font-bold text-slate-800">{lead.data_quality_score ?? 0}%</span>
                    </div>
                    <DataQualityBar score={lead.data_quality_score} />
                    {missingFields.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Missing fields: <span className="text-amber-700">{missingFields.join(', ')}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Source:</span>
                    <span className="font-medium text-slate-800">{lead.source || 'Manual Import'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
