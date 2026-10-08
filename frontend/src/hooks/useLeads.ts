import { useState, useCallback } from 'react';
import { LeadListResponse, Filters, SortField, SortOrder } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export function useLeads() {
  const [data, setData] = useState<LeadListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [filters, setFiltersState] = useState<Filters>({});
  const [sortField, setSortField] = useState<SortField>('fit_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getLeads(filters, sortField, sortOrder, page, pageSize);
      setData(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch leads');
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortField, sortOrder, page, pageSize]);

  const setFilters = (newFilters: Filters) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFiltersState({});
    setPageState(1);
  };

  const setSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPageState(1);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  return {
    data,
    isLoading,
    error,
    filters,
    sortField,
    sortOrder,
    page,
    pageSize,
    fetchLeads,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    setPageSize,
    refresh: fetchLeads
  };
}
