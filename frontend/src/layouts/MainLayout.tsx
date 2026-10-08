import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Compass, Upload, ShieldAlert, Sparkles } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-base tracking-tight text-white">
                      Acquisition Fit Workbench
                    </h1>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded">
                      Command Center
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Find the targets worth investigating first — and know what to verify next.
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-6">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Compass className="h-3.5 w-3.5" />
                  Sourcing Command Center
                </NavLink>

                <NavLink
                  to="/import"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Upload className="h-3.5 w-3.5" />
                  Import Leads & Deduplication
                </NavLink>
              </nav>
            </div>

            {/* Right: Pre-Diligence Badge & Synthetic Data Pill */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Pre-Diligence Qualification Engine</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Demo dataset for interview prototype — Synthetic data only. No external web scraping or predictive AI claims.</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Caprae Capital Full Stack Challenge</span>
        </div>
      </footer>
    </div>
  );
}
