import { useState, useEffect } from 'react';
import { Filters } from '../types';
import { Search, Filter, X, Download } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface FilterBarProps {
  filters: Filters;
  onFilter: (filters: Filters) => void;
  onClear: () => void;
}

export default function FilterBar({ filters, onFilter, onClear }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof Filters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilter(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await api.exportLeads(filters);
      toast.success('Filtered leads exported successfully');
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by company, domain, industry, city, state, or owner..."
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <select
            value={localFilters.priority || ''}
            onChange={(e) => {
              const val = e.target.value;
              const updated = { ...localFilters, priority: val || undefined };
              setLocalFilters(updated);
              onFilter(updated);
            }}
            className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md border bg-white"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority (80–100)</option>
            <option value="MEDIUM">Medium Priority (60–79)</option>
            <option value="LOW">Low Priority (0–59)</option>
            <option value="UNSCORED">Unscored</option>
          </select>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${isExpanded ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </button>
          
          <button
            onClick={handleApply}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Apply
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            title="Export currently filtered leads as CSV"
          >
            <Download className="h-4 w-4 mr-1.5 text-slate-500" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Score Range (0–100)</label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" placeholder="Min" 
                value={localFilters.min_score ?? ''} 
                onChange={(e) => handleChange('min_score', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm border p-1.5 bg-white"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" placeholder="Max" 
                value={localFilters.max_score ?? ''} 
                onChange={(e) => handleChange('max_score', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm border p-1.5 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Revenue Min ($)</label>
            <input 
              type="number" 
              placeholder="e.g. 1000000"
              value={localFilters.min_revenue ?? ''} 
              onChange={(e) => handleChange('min_revenue', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm border p-1.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Min Employees</label>
            <input 
              type="number" 
              placeholder="e.g. 10"
              value={localFilters.min_employees ?? ''} 
              onChange={(e) => handleChange('min_employees', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border-slate-300 rounded-md shadow-sm sm:text-sm border p-1.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Requirements</label>
            <div className="space-y-1">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localFilters.has_decision_maker || false} 
                  onChange={(e) => handleChange('has_decision_maker', e.target.checked || undefined)}
                  className="rounded border-slate-300 text-blue-600 h-3.5 w-3.5"
                />
                <span className="ml-2 text-xs text-slate-600">Decision Maker</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localFilters.has_website || false} 
                  onChange={(e) => handleChange('has_website', e.target.checked || undefined)}
                  className="rounded border-slate-300 text-blue-600 h-3.5 w-3.5"
                />
                <span className="ml-2 text-xs text-slate-600">Has Website</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localFilters.has_email || false} 
                  onChange={(e) => handleChange('has_email', e.target.checked || undefined)}
                  className="rounded border-slate-300 text-blue-600 h-3.5 w-3.5"
                />
                <span className="ml-2 text-xs text-slate-600">Has Email</span>
              </label>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleClear}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Clear All Filters
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center px-4 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
