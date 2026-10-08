import { Lead, SortField, SortOrder } from '../types';
import { ChevronUp, ChevronDown, ExternalLink, Linkedin, Eye } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import PriorityBadge from './PriorityBadge';
import DataQualityBar from './DataQualityBar';
import LoadingSpinner from './LoadingSpinner';

interface LeadTableProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
  isLoading: boolean;
}

export default function LeadTable({ leads, onView, sortField, sortOrder, onSort, isLoading }: LeadTableProps) {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="w-3.5 h-3.5 inline-block ml-1 opacity-0 group-hover:opacity-50">↕</span>;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 inline-block ml-1 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 inline-block ml-1 text-blue-600" />;
  };

  const formatRevenue = (rev: number | null) => {
    if (rev === null || rev === undefined) return '—';
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M`;
    if (rev >= 1000) return `$${(rev / 1000).toFixed(0)}K`;
    return `$${rev}`;
  };

  const getAge = (year: number | null) => {
    if (!year) return '—';
    return `${new Date().getFullYear() - year} yrs`;
  };

  const formatExternalUrl = (url: string | null) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  if (isLoading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner message="Loading leads..." /></div>;
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50 text-slate-600 select-none">
          <tr>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('company_name')}>
              Company {renderSortIcon('company_name')}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
              Industry & Location
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('revenue')}>
              Size & Age {renderSortIcon('revenue')}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
              Decision Maker
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('fit_score')}>
              Fit Score {renderSortIcon('fit_score')}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('data_quality_score')}>
              Data Quality {renderSortIcon('data_quality_score')}
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200 text-sm">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="font-semibold text-slate-900">{lead.company_name}</div>
                <div className="text-xs text-slate-500">{lead.domain || '—'}</div>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-slate-900">{lead.industry || '—'}</div>
                <div className="text-xs text-slate-500">{lead.city ? `${lead.city}, ${lead.state}` : (lead.state || '—')}</div>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="font-medium text-slate-900">{formatRevenue(lead.revenue)}</div>
                <div className="text-xs text-slate-500">{lead.employee_count ? `${lead.employee_count} emp` : '—'} • {getAge(lead.founded_year)}</div>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                {lead.owner_name ? (
                  <>
                    <div className="font-medium text-slate-900">{lead.owner_name}</div>
                    <div className="text-slate-500 text-xs">{lead.owner_title || 'Decision Maker'}</div>
                  </>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <ScoreBadge score={lead.fit_score} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <PriorityBadge priority={lead.priority} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <DataQualityBar score={lead.data_quality_score} />
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap text-right font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {lead.website ? (
                    <a 
                      href={formatExternalUrl(lead.website)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Open Company Website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="p-1 opacity-20 cursor-not-allowed text-slate-300" title="No website available">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  )}
                  {lead.linkedin_url ? (
                    <a 
                      href={formatExternalUrl(lead.linkedin_url)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Open LinkedIn Profile"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="p-1 opacity-20 cursor-not-allowed text-slate-300" title="No LinkedIn available">
                      <Linkedin className="h-4 w-4" />
                    </span>
                  )}
                  <button 
                    onClick={() => onView(lead)} 
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors inline-flex items-center"
                    title="View Full Acquisition Fit Details"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span>View</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
