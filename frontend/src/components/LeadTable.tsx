import React from 'react';
import { Lead, SortField, SortOrder } from '../types';
import { ChevronUp, ChevronDown, ExternalLink, Linkedin, Eye, Star } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import PriorityBadge from './PriorityBadge';
import LoadingSpinner from './LoadingSpinner';

interface LeadTableProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
  isLoading: boolean;
  onToggleShortlist?: (leadId: number) => void;
  selectedForCompare?: number[];
  onToggleCompare?: (leadId: number) => void;
}

export default function LeadTable({
  leads,
  onView,
  sortField,
  sortOrder,
  onSort,
  isLoading,
  onToggleShortlist,
  selectedForCompare = [],
  onToggleCompare
}: LeadTableProps) {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="w-3.5 h-3.5 inline-block ml-1 opacity-20 group-hover:opacity-60">↕</span>;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 inline-block ml-1 text-indigo-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline-block ml-1 text-indigo-400" />
    );
  };

  const formatRevenue = (rev: number | null) => {
    if (rev === null || rev === undefined) return '—';
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M`;
    if (rev >= 1000) return `$${(rev / 1000).toFixed(0)}K`;
    return `$${rev.toLocaleString()}`;
  };

  const formatExternalUrl = (url: string | null) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Querying acquisition candidates..." />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900 shadow-sm">
      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
        <thead className="bg-slate-950/80 text-slate-400 select-none">
          <tr>
            {/* Compare Select Checkbox */}
            <th scope="col" className="w-10 px-3 py-3.5 text-center">
              <span className="sr-only">Compare</span>
            </th>

            {/* Shortlist Star */}
            <th scope="col" className="w-10 px-2 py-3.5 text-center">
              <span className="sr-only">Shortlist</span>
            </th>

            {/* Company Name */}
            <th
              scope="col"
              className="px-4 py-3.5 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 group"
              onClick={() => handleSort('company_name')}
            >
              Company {renderSortIcon('company_name')}
            </th>

            {/* Industry & Location */}
            <th scope="col" className="px-4 py-3.5 font-semibold uppercase tracking-wider">
              Industry / Location
            </th>

            {/* Revenue */}
            <th
              scope="col"
              className="px-3 py-3.5 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 group"
              onClick={() => handleSort('revenue')}
            >
              Revenue {renderSortIcon('revenue')}
            </th>

            {/* Headcount */}
            <th
              scope="col"
              className="px-3 py-3.5 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 group"
              onClick={() => handleSort('employee_count')}
            >
              Employees {renderSortIcon('employee_count')}
            </th>

            {/* Fit Score */}
            <th
              scope="col"
              className="px-3 py-3.5 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 group text-center"
              onClick={() => handleSort('fit_score')}
            >
              Fit Score {renderSortIcon('fit_score')}
            </th>

            {/* Data Confidence */}
            <th
              scope="col"
              className="px-3 py-3.5 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 group text-center"
              onClick={() => handleSort('data_quality_score')}
            >
              Confidence {renderSortIcon('data_quality_score')}
            </th>

            {/* Priority Tier */}
            <th scope="col" className="px-3 py-3.5 font-semibold uppercase tracking-wider text-center">
              Priority
            </th>

            {/* Next Best Action */}
            <th scope="col" className="px-4 py-3.5 font-semibold uppercase tracking-wider hidden xl:table-cell">
              Next Best Action
            </th>

            {/* Quick Actions */}
            <th scope="col" className="px-3 py-3.5 font-semibold uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/80 text-slate-200">
          {leads.map((lead) => {
            const isSelected = selectedForCompare.includes(lead.id);
            const isShort = Boolean(lead.is_shortlisted);

            return (
              <tr
                key={lead.id}
                className="hover:bg-slate-800/50 transition-colors duration-100 group"
              >
                {/* Select for Compare Checkbox */}
                <td className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCompare && onToggleCompare(lead.id)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    title="Select to compare (max 3)"
                  />
                </td>

                {/* Shortlist Star */}
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleShortlist && onToggleShortlist(lead.id)}
                    className={`p-1 rounded transition-colors ${
                      isShort
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={isShort ? 'Remove from Shortlist' : 'Add to Shortlist'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isShort ? 'fill-amber-400' : ''}`} />
                  </button>
                </td>

                {/* Company Name & Link */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {lead.company_name}
                  </div>
                  {lead.domain && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {lead.domain}
                    </span>
                  )}
                </td>

                {/* Industry / Location */}
                <td className="px-4 py-3">
                  <div className="text-slate-200 font-medium">
                    {lead.industry || '—'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lead.city ? `${lead.city}, ` : ''}{lead.state || 'USA'}
                  </div>
                </td>

                {/* Revenue */}
                <td className="px-3 py-3 font-mono font-medium text-slate-200">
                  {formatRevenue(lead.revenue)}
                </td>

                {/* Headcount */}
                <td className="px-3 py-3 font-mono text-slate-300">
                  {lead.employee_count !== null ? `${lead.employee_count}` : '—'}
                </td>

                {/* Fit Score */}
                <td className="px-3 py-3 text-center">
                  <ScoreBadge score={lead.fit_score} />
                </td>

                {/* Data Confidence */}
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex items-center gap-1.5 font-mono">
                    <span
                      className={`text-xs font-bold ${
                        (lead.data_quality_score || 0) >= 75
                          ? 'text-cyan-400'
                          : (lead.data_quality_score || 0) >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {(lead.data_quality_score || 0).toFixed(0)}%
                    </span>
                  </div>
                </td>

                {/* Priority */}
                <td className="px-3 py-3 text-center">
                  <PriorityBadge priority={lead.priority} />
                </td>

                {/* Next Best Action */}
                <td className="px-4 py-3 hidden xl:table-cell">
                  <span className="text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded truncate max-w-xs inline-block">
                    {lead.next_best_action || 'Verify company data'}
                  </span>
                </td>

                {/* Action button */}
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {lead.website && (
                      <a
                        href={formatExternalUrl(lead.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                        title="Open Website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(lead)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Brief</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
