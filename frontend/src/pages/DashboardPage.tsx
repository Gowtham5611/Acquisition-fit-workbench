import { useEffect, useState, useCallback } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useStats } from '../hooks/useStats';
import { useICP } from '../hooks/useICP';
import { useShortlist } from '../hooks/useShortlist';
import ViewToggle from '../components/ViewToggle';
import ExecutiveView from '../components/ExecutiveView';
import ICPForm from '../components/ICPForm';
import PrioritySummary from '../components/PrioritySummary';
import FilterBar from '../components/FilterBar';
import LeadTable from '../components/LeadTable';
import Pagination from '../components/Pagination';
import LeadDetailDrawer from '../components/LeadDetailDrawer';
import EmptyState from '../components/EmptyState';
import CompareModal from '../components/CompareModal';
import AcquisitionBriefModal from '../components/AcquisitionBriefModal';
import { Lead, InsightsResponse, CompareResponse, AcquisitionBriefResponse } from '../types';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { 
  Play, Download, Scale, Star, Search, SlidersHorizontal, RefreshCw 
} from 'lucide-react';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<'executive' | 'research'>('executive');
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [isICPOpen, setIsICPOpen] = useState(false);

  const { stats, refresh: refreshStats } = useStats();
  const { config, saveConfig, resetConfig } = useICP();
  const { shortlist, shortlistCount, toggleShortlist, isShortlisted, fetchShortlist } = useShortlist();

  const {
    data: leadsData,
    isLoading: leadsLoading,
    filters,
    setFilters,
    clearFilters,
    sortField,
    sortOrder,
    setSort,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchLeads,
    refresh: refreshLeads
  } = useLeads();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [scoring, setScoring] = useState(false);

  // Compare targets state (up to 3 targets)
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCompareLoading, setIsCompareLoading] = useState(false);

  // Acquisition Brief state
  const [briefData, setBriefData] = useState<AcquisitionBriefResponse | null>(null);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    try {
      setInsightsLoading(true);
      const data = await api.getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    fetchLeads();
  }, [fetchInsights, fetchLeads]);

  const handleScoreLeads = async () => {
    setScoring(true);
    try {
      const res = await api.scoreLeads(config);
      toast.success(`Pipeline scored successfully (${res.scored_count} targets evaluated)`);
      await Promise.all([fetchInsights(), refreshLeads(), refreshStats()]);
    } catch (e: any) {
      toast.error(e.message || 'Failed to score pipeline');
    } finally {
      setScoring(false);
    }
  };

  const handleSelectLeadById = async (id: number) => {
    try {
      const lead = await api.getLead(id);
      setSelectedLead(lead);
    } catch (e) {
      toast.error('Failed to open lead details');
    }
  };

  const handleToggleCompare = (leadId: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      }
      if (prev.length >= 3) {
        toast.error('You can compare a maximum of 3 targets simultaneously.');
        return prev;
      }
      return [...prev, leadId];
    });
  };

  const handleOpenCompare = async () => {
    if (selectedForCompare.length < 2 || selectedForCompare.length > 3) {
      toast.error('Select exactly 2 or 3 targets to generate a comparison matrix.');
      return;
    }
    setIsCompareLoading(true);
    setIsCompareOpen(true);
    try {
      const comp = await api.compareTargets(selectedForCompare);
      setCompareData(comp);
    } catch (e: any) {
      toast.error(e.message || 'Comparison failed');
      setIsCompareOpen(false);
    } finally {
      setIsCompareLoading(false);
    }
  };

  const handleGenerateBrief = async (leadId: number) => {
    setIsBriefLoading(true);
    setIsBriefOpen(true);
    try {
      const brief = await api.getAcquisitionBrief(leadId);
      setBriefData(brief);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate brief');
      setIsBriefOpen(false);
    } finally {
      setIsBriefLoading(false);
    }
  };

  const handleToggleShortlist = async (leadId: number) => {
    const currently = isShortlisted(leadId);
    await toggleShortlist(leadId, currently);
    // Refresh insights & table
    fetchInsights();
    refreshLeads();
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, is_shortlisted: !currently } : null);
    }
  };

  const handleExportCSV = async () => {
    try {
      await api.exportLeads(filters, sortField, sortOrder);
      toast.success('Filtered acquisition targets exported to CSV');
    } catch (e) {
      toast.error('Failed to export leads');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Command Bar & Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: View Toggle & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />

          {/* Quick Search */}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies, domain, industry..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Right: Actions (Configure ICP, Score Leads, Shortlist, Compare, Export) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsICPOpen(!isICPOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Configure ICP</span>
          </button>

          <button
            type="button"
            onClick={handleScoreLeads}
            disabled={scoring}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {scoring ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Score Leads</span>
          </button>

          {/* Compare Targets Button */}
          <button
            type="button"
            onClick={handleOpenCompare}
            disabled={selectedForCompare.length < 2 || selectedForCompare.length > 3}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedForCompare.length >= 2 && selectedForCompare.length <= 3
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700 hover:bg-indigo-900 cursor-pointer shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="Select 2 or 3 targets to compare"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare ({selectedForCompare.length}/3)</span>
          </button>

          {/* Shortlist Filter Toggle */}
          <button
            type="button"
            onClick={() => {
              if (filters.is_shortlisted) {
                setFilters({ ...filters, is_shortlisted: undefined });
              } else {
                setFilters({ ...filters, is_shortlisted: true });
                setCurrentView('research');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              filters.is_shortlisted
                ? 'bg-amber-950 text-amber-300 border-amber-600'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filters.is_shortlisted ? 'fill-amber-400' : ''}`} />
            <span>Shortlist ({shortlistCount})</span>
          </button>

          {/* CSV Export */}
          {currentView === 'research' && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable ICP Configuration Panel */}
      <ICPForm 
        config={config} 
        onSave={saveConfig} 
        onReset={resetConfig} 
        onScore={handleScoreLeads}
        isScoring={scoring}
        isOpenControlled={isICPOpen}
        onToggleOpen={() => setIsICPOpen(!isICPOpen)}
      />

      {/* Main View Area: Executive vs Research */}
      {currentView === 'executive' ? (
        <ExecutiveView
          insights={insights}
          onSelectLead={handleSelectLeadById}
          isLoading={insightsLoading}
        />
      ) : (
        /* Research View: Detailed Pipeline Grid */
        <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <PrioritySummary stats={stats} onFilter={(p) => setFilters({ ...filters, priority: p })} />
          </div>

          <FilterBar filters={filters} onFilter={setFilters} onClear={clearFilters} />

          {leadsData?.items && leadsData.items.length > 0 ? (
            <>
              <LeadTable 
                leads={leadsData.items} 
                onView={(lead) => setSelectedLead(lead)}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={setSort}
                isLoading={leadsLoading}
                onToggleShortlist={handleToggleShortlist}
                selectedForCompare={selectedForCompare}
                onToggleCompare={handleToggleCompare}
              />
              <div className="pt-2">
                <Pagination 
                  page={page} 
                  pageSize={pageSize} 
                  totalPages={leadsData.total_pages}
                  total={leadsData.total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          ) : (
            <EmptyState 
              isLoading={leadsLoading}
              message="No leads found matching your thesis filters. Try clearing filters or importing data." 
            />
          )}
        </div>
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)}
        onToggleShortlist={handleToggleShortlist}
        isShortlisted={selectedLead ? isShortlisted(selectedLead.id) : false}
        onGenerateBrief={handleGenerateBrief}
      />

      {/* Side-by-Side Target Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        data={compareData}
        isLoading={isCompareLoading}
      />

      {/* Preliminary Acquisition Research Brief Modal */}
      <AcquisitionBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        brief={briefData}
        isLoading={isBriefLoading}
      />
    </div>
  );
}
