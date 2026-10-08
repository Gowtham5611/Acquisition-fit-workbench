import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, LayoutDashboard, Upload } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="font-bold text-lg leading-tight text-slate-900">Acquisition Fit Workbench</h1>
                  <p className="text-xs text-slate-500 hidden sm:block">Prioritize acquisition targets using explainable company-fit signals</p>
                </div>
              </div>
              <nav className="ml-10 flex space-x-8">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`
                  }
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/import"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-400">
            Demo dataset for interview prototype — Synthetic data only
          </p>
        </div>
      </footer>
    </div>
  );
}
