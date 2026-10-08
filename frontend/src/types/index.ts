export interface Lead {
  id: number;
  company_name: string;
  website: string | null;
  domain: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employee_count: number | null;
  revenue: number | null;
  founded_year: number | null;
  owner_name: string | null;
  owner_title: string | null;
  owner_email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  source: string | null;
  source_url: string | null;
  data_quality_score: number | null;
  fit_score: number | null;
  priority: string | null;
  score_breakdown: Record<string, number> | null;
  score_reasons: { positive: string[]; negative: string[] } | null;
  created_at: string;
  updated_at: string;
}

export interface LeadListResponse {
  items: Lead[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ICPConfig {
  target_industries: string[];
  target_locations: string[];
  min_employees: number | null;
  max_employees: number | null;
  min_revenue: number | null;
  max_revenue: number | null;
  min_years: number | null;
  max_years: number | null;
  decision_maker_preferred: boolean;
  website_preferred: boolean;
  exclusion_keywords: string[];
}

export interface Stats {
  total_leads: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  avg_fit_score: number;
  avg_data_quality: number;
  scored_leads: number;
  unscored_leads: number;
}

export interface ImportResult {
  rows_received: number;
  valid_rows: number;
  invalid_rows: number;
  duplicates_found: number;
  rows_imported: number;
  errors: string[];
}

export interface Filters {
  priority?: string;
  industry?: string;
  state?: string;
  min_score?: number;
  max_score?: number;
  min_revenue?: number;
  max_revenue?: number;
  min_employees?: number;
  max_employees?: number;
  min_data_quality?: number;
  has_email?: boolean;
  has_website?: boolean;
  has_decision_maker?: boolean;
  search?: string;
}

export type SortField = 'fit_score' | 'data_quality_score' | 'revenue' | 'employee_count' | 'company_name' | 'created_at';
export type SortOrder = 'asc' | 'desc';
