import React from 'react';
import { AcquisitionBriefResponse } from '../types';
import { X, Printer, FileText, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

interface AcquisitionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: AcquisitionBriefResponse | null;
  isLoading?: boolean;
}

export default function AcquisitionBriefModal({ isOpen, onClose, brief, isLoading }: AcquisitionBriefModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:w-full print:border-none print:bg-white print:text-black">
        {/* Modal Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Preliminary Acquisition Brief
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-0">
          {isLoading ? (
            <div className="py-24 text-center text-slate-400 text-sm">
              Generating preliminary research brief...
            </div>
          ) : !brief ? (
            <div className="py-24 text-center text-slate-500 text-sm">
              Brief unavailable.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-slate-700/80 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400 print:text-indigo-700 block mb-1">
                      CAPRAE SOURCING COMMAND CENTER • RESEARCH BRIEF
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-white print:text-black">
                      {brief.company_name}
                    </h1>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Generated: {brief.generated_at}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 print:text-emerald-700">
                      Target #{brief.lead_id}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic mt-2">
                  {brief.disclaimer}
                </p>
              </div>

              {/* Acquisition Fit & Data Confidence Strip */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-lg print:border-gray-300 print:bg-gray-50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Acquisition Fit Score
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400 print:text-emerald-700">
                    {brief.acquisition_fit.fit_score.toFixed(0)}/100
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Priority: {brief.acquisition_fit.priority}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Data Confidence
                  </span>
                  <span className="text-xl font-bold font-mono text-cyan-400 print:text-cyan-700">
                    {brief.acquisition_fit.data_confidence.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Information completeness
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Opportunity Quadrant
                  </span>
                  <span className="text-sm font-bold text-slate-200 print:text-gray-900 block mt-1">
                    {brief.acquisition_fit.quadrant}
                  </span>
                </div>
              </div>

              {/* Next Best Action Callout */}
              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-lg p-3.5 flex items-start gap-2.5 print:bg-indigo-50 print:border-indigo-200">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                    Recommended Next Action
                  </span>
                  <span className="text-sm font-semibold text-white print:text-indigo-900">
                    {brief.next_best_action}
                  </span>
                </div>
              </div>

              {/* Target Snapshot Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1.5 mb-3">
                  Target Snapshot
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Industry</span>
                    <span className="font-semibold text-slate-100">{brief.target_snapshot.industry}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Location</span>
                    <span className="font-semibold text-slate-100">{brief.target_snapshot.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Reported Revenue</span>
                    <span className="font-semibold font-mono text-slate-100">{brief.target_snapshot.revenue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Headcount</span>
                    <span className="font-semibold font-mono text-slate-100">{brief.target_snapshot.employee_count}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Operating History</span>
                    <span className="font-semibold text-slate-100">
                      {brief.target_snapshot.business_age_years} yrs (Est. {brief.target_snapshot.founded_year})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Decision Maker</span>
                    <span className="font-semibold text-slate-100">
                      {brief.target_snapshot.decision_maker} ({brief.target_snapshot.decision_maker_title})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Contact Email</span>
                    <span className="font-semibold text-slate-100 truncate block">{brief.target_snapshot.contact_email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Website</span>
                    <span className="font-semibold text-indigo-400 truncate block">{brief.target_snapshot.website}</span>
                  </div>
                </div>
              </div>

              {/* Why It Ranks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1.5 mb-2.5">
                  Why It Ranks (Thesis Alignment Factors)
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {brief.why_it_ranks.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verify Before Proceeding (Verification Gaps) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1.5 mb-2.5">
                  Verify Before Proceeding (Data Gaps Checklist)
                </h3>
                {brief.verify_before_proceeding.length === 0 ? (
                  <p className="text-xs text-emerald-400">
                    ✓ Core firmographic and contact parameters verified with high completeness.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {brief.verify_before_proceeding.map((gap, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/60 border border-slate-800 rounded p-2.5 flex items-start gap-2.5 text-xs"
                      >
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0 ${
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
                          <span className="font-bold text-slate-200 block">{gap.label}</span>
                          <span className="text-slate-400 text-[11px]">{gap.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source & Provenance */}
              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <div>
                  <span>Source: {brief.source_metadata.source}</span>
                  {brief.source_metadata.source_url && (
                    <span className="ml-2 font-mono text-[10px]">({brief.source_metadata.source_url})</span>
                  )}
                </div>
                <span>Confidential Internal Research • Caprae Capital</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
