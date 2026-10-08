import { useEffect, useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useStats } from '../hooks/useStats';
import { useICP } from '../hooks/useICP';
import KPICards from '../components/KPICards';
import ICPForm from '../components/ICPForm';
import PrioritySummary from '../components/PrioritySummary';
import FilterBar from '../components/FilterBar';
import LeadTable from '../components/LeadTable';
import Pagination from '../components/Pagination';
import LeadDetailDrawer from '../components/LeadDetailDrawer';
import EmptyState from '../components/EmptyState';
import { Lead } from '../types';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function DashboardPage() {
  const { stats, refresh: refreshStats, isLoading: statsLoading } = useStats();
  const { config, saveConfig, resetConfig } = useICP();
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

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleScoreLeads = async () => {
    setScoring(true);
    try {
      await api.scoreLeads(config);
      toast.success('Leads scored successfully');
      refreshLeads();
      refreshStats();
    } catch (e: any) {
      toast.error(e.message || 'Failed to score leads');
    } finally {
      setScoring(false);
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const closeDrawer = () => {
    setSelectedLead(null);
  };

  return (
    <div className="space-y-6">
      <KPICards stats={stats} isLoading={statsLoading} />
      
      <ICPForm 
        config={config} 
        onSave={saveConfig} 
        onReset={resetConfig} 
        onScore={handleScoreLeads}
        isScoring={scoring}
      />

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <PrioritySummary stats={stats} onFilter={(p) => setFilters({ ...filters, priority: p })} />
        </div>

        <FilterBar filters={filters} onFilter={setFilters} onClear={clearFilters} />

        {leadsData?.items && leadsData.items.length > 0 ? (
          <>
            <LeadTable 
              leads={leadsData.items} 
              onView={handleViewLead}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={setSort}
              isLoading={leadsLoading}
            />
            <div className="mt-4">
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
            message="No leads found matching your criteria. Try adjusting filters or importing data." 
          />
        )}
      </div>

      <LeadDetailDrawer lead={selectedLead} onClose={closeDrawer} />
    </div>
  );
}
