import { useState } from 'react';
import { ICPConfig } from '../types';
import { ChevronDown, ChevronUp, Sliders, RotateCcw, Play } from 'lucide-react';

interface ICPFormProps {
  config: ICPConfig;
  onSave: (config: Partial<ICPConfig>) => void;
  onReset: () => void;
  onScore: () => void;
  isScoring: boolean;
  isOpenControlled?: boolean;
  onToggleOpen?: () => void;
}

export default function ICPForm({
  config,
  onSave,
  onReset,
  onScore,
  isScoring,
  isOpenControlled,
  onToggleOpen
}: ICPFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;

  const toggleOpen = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const handleArrayChange = (key: keyof ICPConfig, value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    onSave({ [key]: arr });
  };

  const handleNumberChange = (key: keyof ICPConfig, value: string) => {
    onSave({ [key]: value ? Number(value) : null });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
      <button 
        type="button"
        onClick={toggleOpen}
        className="w-full px-6 py-3.5 flex items-center justify-between bg-slate-950/70 hover:bg-slate-950 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Ideal Company Profile (ICP) Criteria
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            • {config.target_industries.length > 0 ? config.target_industries.join(', ') : 'All industries'} 
            {config.target_locations.length > 0 ? ` (${config.target_locations.join(', ')})` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] font-mono">{isOpen ? 'Hide Panel' : 'Edit Criteria'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-800 bg-slate-900/95 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Industries (comma-separated)
              </label>
              <input 
                type="text" 
                value={config.target_industries.join(', ')}
                onChange={(e) => handleArrayChange('target_industries', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                placeholder="e.g. SaaS, Healthcare, FinTech"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Locations / States (comma-separated)
              </label>
              <input 
                type="text" 
                value={config.target_locations.join(', ')}
                onChange={(e) => handleArrayChange('target_locations', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                placeholder="e.g. TX, CA, NY, FL"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Headcount Range (Employees)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.min_employees ?? ''}
                  onChange={(e) => handleNumberChange('min_employees', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Min (e.g. 10)"
                />
                <span className="text-slate-500 font-medium">to</span>
                <input 
                  type="number" 
                  value={config.max_employees ?? ''}
                  onChange={(e) => handleNumberChange('max_employees', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Max (e.g. 250)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Revenue Scope Range ($ USD)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.min_revenue ?? ''}
                  onChange={(e) => handleNumberChange('min_revenue', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Min ($1,000,000)"
                />
                <span className="text-slate-500 font-medium">to</span>
                <input 
                  type="number" 
                  value={config.max_revenue ?? ''}
                  onChange={(e) => handleNumberChange('max_revenue', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Max ($50,000,000)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Operating Longevity (Years in Business)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.min_years ?? ''}
                  onChange={(e) => handleNumberChange('min_years', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Min (e.g. 3)"
                />
                <span className="text-slate-500 font-medium">to</span>
                <input 
                  type="number" 
                  value={config.max_years ?? ''}
                  onChange={(e) => handleNumberChange('max_years', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Max (e.g. 30)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Exclusion Keywords (Penalize / Deprioritize)
              </label>
              <input 
                type="text" 
                value={config.exclusion_keywords.join(', ')}
                onChange={(e) => handleArrayChange('exclusion_keywords', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                placeholder="e.g. franchise, nonprofit, consulting"
              />
            </div>
            
            <div className="flex flex-wrap gap-6 items-center md:col-span-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.decision_maker_preferred}
                  onChange={(e) => onSave({ decision_maker_preferred: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">Prioritize leads with identified decision-maker</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.website_preferred}
                  onChange={(e) => onSave({ website_preferred: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">Prioritize leads with verified online presence</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onReset}
              disabled={isScoring}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={onScore}
              disabled={isScoring}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isScoring ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Scoring Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Pipeline Scoring</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
