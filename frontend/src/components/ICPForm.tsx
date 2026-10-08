import { useState } from 'react';
import { ICPConfig } from '../types';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface ICPFormProps {
  config: ICPConfig;
  onSave: (config: Partial<ICPConfig>) => void;
  onReset: () => void;
  onScore: () => void;
  isScoring: boolean;
}

export default function ICPForm({ config, onSave, onReset, onScore, isScoring }: ICPFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleArrayChange = (key: keyof ICPConfig, value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    onSave({ [key]: arr });
  };

  const handleNumberChange = (key: keyof ICPConfig, value: string) => {
    onSave({ [key]: value ? Number(value) : null });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center text-slate-900 font-medium">
          <Settings className="h-5 w-5 mr-2 text-slate-500" />
          Configure Ideal Company Profile (ICP)
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Industries (comma separated)</label>
              <input 
                type="text" 
                value={config.target_industries.join(', ')}
                onChange={(e) => handleArrayChange('target_industries', e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="e.g. Software, Healthcare, Manufacturing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Locations (comma separated)</label>
              <input 
                type="text" 
                value={config.target_locations.join(', ')}
                onChange={(e) => handleArrayChange('target_locations', e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="e.g. California, New York, Texas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee Range</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={config.min_employees || ''}
                  onChange={(e) => handleNumberChange('min_employees', e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Min"
                />
                <span className="text-slate-500">to</span>
                <input 
                  type="number" 
                  value={config.max_employees || ''}
                  onChange={(e) => handleNumberChange('max_employees', e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Revenue Range ($)</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={config.min_revenue || ''}
                  onChange={(e) => handleNumberChange('min_revenue', e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Min"
                />
                <span className="text-slate-500">to</span>
                <input 
                  type="number" 
                  value={config.max_revenue || ''}
                  onChange={(e) => handleNumberChange('max_revenue', e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years in Business</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={config.min_years || ''}
                  onChange={(e) => handleNumberChange('min_years', e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Min"
                />
                <span className="text-slate-500">to</span>
                <input 
                  type="number" 
                  value={config.max_years || ''}
                  onChange={(e) => handleNumberChange('max_years', e.target.value)}
                  className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exclusion Keywords</label>
              <input 
                type="text" 
                value={config.exclusion_keywords.join(', ')}
                onChange={(e) => handleArrayChange('exclusion_keywords', e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="e.g. Non-profit, Government"
              />
            </div>
            
            <div className="flex flex-col space-y-4 justify-center md:col-span-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.decision_maker_preferred}
                  onChange={(e) => onSave({ decision_maker_preferred: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-slate-700">Prefer leads with known decision makers</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.website_preferred}
                  onChange={(e) => onSave({ website_preferred: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-slate-700">Prefer leads with websites</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={onReset}
              disabled={isScoring}
              className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={onScore}
              disabled={isScoring}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isScoring ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scoring...
                </>
              ) : 'Score Leads'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
