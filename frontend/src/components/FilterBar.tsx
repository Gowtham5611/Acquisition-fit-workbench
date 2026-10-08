import { useState, useEffect } from 'react';
import { Filters } from '../types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: Filters;
  onFilter: (filters: Filters) => void;
  onClear: () => void;
}

export default function FilterBar({ filters, onFilter, onClear }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={localFilters.priority || ''}
            onChange={(e) => {
              const val = e.target.value;
              const updated = { ...localFilters, priority: val || undefined };
              setLocalFilters(updated);
              onFilter(updated);
            }}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority (80–100)</option>
            <option value="MEDIUM">Medium Priority (60–79)</option>
            <option value="LOW">Low Priority (0–59)</option>
            <option value="UNSCORED">Unscored</option>
          </select>

          <input
            type="text"
            placeholder="Filter industry..."
            value={localFilters.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value || undefined)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 placeholder-slate-500 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-36"
          />

          <input
            type="text"
            placeholder="State (e.g. TX)..."
            value={localFilters.state || ''}
            onChange={(e) => handleChange('state', e.target.value || undefined)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 placeholder-slate-500 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-28 uppercase"
          />

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${
              isExpanded 
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700' 
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>More Parameters</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(localFilters.industry || localFilters.state || localFilters.priority || localFilters.min_score || localFilters.min_revenue || localFilters.has_decision_maker) && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Score Range (0–100)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" placeholder="Min" 
                value={localFilters.min_score ?? ''} 
                onChange={(e) => handleChange('min_score', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-slate-200 text-xs font-mono"
              />
              <span className="text-slate-500">-</span>
              <input 
                type="number" placeholder="Max" 
                value={localFilters.max_score ?? ''} 
                onChange={(e) => handleChange('max_score', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Revenue Min ($ USD)</label>
            <input 
              type="number" 
              placeholder="e.g. 1000000"
              value={localFilters.min_revenue ?? ''} 
              onChange={(e) => handleChange('min_revenue', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-slate-200 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Headcount Min (Employees)</label>
            <input 
              type="number" 
              placeholder="e.g. 10"
              value={localFilters.min_employees ?? ''} 
              onChange={(e) => handleChange('min_employees', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-slate-200 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Requirements</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localFilters.has_decision_maker || false} 
                  onChange={(e) => handleChange('has_decision_maker', e.target.checked || undefined)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 h-3.5 w-3.5"
                />
                <span className="text-slate-300 text-xs">Identified Decision Maker</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localFilters.has_website || false} 
                  onChange={(e) => handleChange('has_website', e.target.checked || undefined)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 h-3.5 w-3.5"
                />
                <span className="text-slate-300 text-xs">Verified Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localFilters.has_email || false} 
                  onChange={(e) => handleChange('has_email', e.target.checked || undefined)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 h-3.5 w-3.5"
                />
                <span className="text-slate-300 text-xs">Direct Owner Email</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
