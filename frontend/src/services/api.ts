import { LeadListResponse, Lead, Stats, ImportResult, Filters, SortField, SortOrder, ICPConfig } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithHandle(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = 'API Error';
    try {
      const data = await response.json();
      message = data.detail || data.message || response.statusText;
    } catch {
      message = response.statusText;
    }
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export const api = {
  getLeads: async (
    filters: Filters,
    sortField: SortField = 'fit_score',
    sortOrder: SortOrder = 'desc',
    page = 1,
    pageSize = 20
  ): Promise<LeadListResponse> => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    params.append('sort_by', sortField);
    params.append('sort_order', sortOrder);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return fetchWithHandle(`/leads?${params.toString()}`);
  },

  getLead: async (id: number): Promise<Lead> => {
    return fetchWithHandle(`/leads/${id}`);
  },

  getStats: async (): Promise<Stats> => {
    return fetchWithHandle('/stats');
  },

  scoreLeads: async (config: ICPConfig): Promise<{ message: string; scored_count: number }> => {
    return fetchWithHandle('/leads/score', {
      method: 'POST',
      body: JSON.stringify({ icp: config }),
    });
  },

  importCSV: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/leads/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = 'Import failed';
      try {
        const data = await response.json();
        message = data.detail || message;
      } catch {
        message = response.statusText;
      }
      throw new Error(message);
    }

    return response.json();
  },

  loadDemo: async (): Promise<ImportResult> => {
    return fetchWithHandle('/leads/load-demo', { method: 'POST' });
  },

  exportLeads: async (
    filters: Filters,
    sortField: SortField = 'fit_score',
    sortOrder: SortOrder = 'desc'
  ): Promise<void> => {
    const params = new URLSearchParams();
    params.append('sort_by', sortField);
    params.append('sort_order', sortOrder);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/leads/export?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to export leads');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acquisition_fit_leads.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
