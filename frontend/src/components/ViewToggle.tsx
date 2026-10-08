import React from 'react';
import { LayoutDashboard, TableProperties } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'executive' | 'research';
  onViewChange: (view: 'executive' | 'research') => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-700/60 rounded-lg shadow-inner">
      <button
        type="button"
        onClick={() => onViewChange('executive')}
        className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
          currentView === 'executive'
            ? 'bg-indigo-600 text-white shadow-sm font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        EXECUTIVE VIEW
      </button>
      <button
        type="button"
        onClick={() => onViewChange('research')}
        className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
          currentView === 'research'
            ? 'bg-indigo-600 text-white shadow-sm font-bold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <TableProperties className="w-3.5 h-3.5" />
        RESEARCH VIEW
      </button>
    </div>
  );
}

