import React from 'react';
import { CompareResponse } from '../types';
import { X, Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompareResponse | null;
  isLoading?: boolean;
}

export default function CompareModal({ isOpen, onClose, data, isLoading }: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Target Sourcing Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Side-by-side evaluation against active acquisition thesis criteria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Analyzing targets...
            </div>
          ) : !data || data.targets.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              No comparison targets selected. Please select 2 or 3 targets to compare.
            </div>
          ) : (
            <>
              {/* Objective Relative Highlights */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Objective Evaluation Notes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 border border-emerald-900/40 rounded p-2.5 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Strongest Fit
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        {data.strongest_fit}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-indigo-900/40 rounded p-2.5 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Best Data Confidence
                      </span>
                      <span className="text-xs font-bold text-indigo-300">
                        {data.best_confidence}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-amber-900/40 rounded p-2.5 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Needs Most Verification
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        {data.needs_most_verification}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800">
                      <th className="py-3 px-4 font-semibold text-slate-400 uppercase w-40">
                        Evaluation Dimension
                      </th>
                      {data.targets.map((t) => (
                        <th key={t.id} className="py-3 px-4 font-bold text-slate-100 text-sm">
                          {t.company_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr className="bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Fit Score</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 font-mono font-bold text-emerald-400">
                          {t.fit_score !== null ? `${t.fit_score.toFixed(0)}/100` : 'Unscored'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Data Confidence</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 font-mono font-bold text-cyan-300">
                          {t.data_confidence.toFixed(0)}%
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Priority Tier</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              t.priority === 'HIGH'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : t.priority === 'MEDIUM'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Matrix Quadrant</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 font-semibold text-slate-200">
                          {t.quadrant_label}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Industry</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 text-slate-200">
                          {t.industry || 'Unspecified'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Location</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 text-slate-200">
                          {t.location || 'Unspecified'}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Reported Revenue</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 font-mono text-slate-200">
                          {t.revenue ? `$${t.revenue.toLocaleString()}` : 'Unrecorded'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Headcount</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 font-mono text-slate-200">
                          {t.employee_count !== null ? `${t.employee_count} employees` : 'Unrecorded'}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Operating History</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 text-slate-200">
                          {t.business_age !== null ? `${t.business_age} years (Est. ${t.founded_year})` : 'Unrecorded'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Decision Maker</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 text-slate-200">
                          {t.decision_maker ? (
                            <span>
                              {t.decision_maker} {t.decision_maker_title ? `(${t.decision_maker_title})` : ''}
                            </span>
                          ) : (
                            <span className="text-amber-400 italic">Unidentified</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">Next Best Action</td>
                      {data.targets.map((t) => (
                        <td key={t.id} className="py-2.5 px-4 text-indigo-300 font-medium">
                          {t.next_best_action}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Objective comparison based on current database values and thesis criteria.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
