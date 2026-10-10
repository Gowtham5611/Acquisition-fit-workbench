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
  next_best_action: string | null;
  is_shortlisted: boolean;
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
  unscored_leads: number;
  scored_leads: number;
  shortlisted_leads: number;
  avg_fit_score: number;
  avg_data_quality: number;
}

export interface VerificationGap {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  field: string;
  label: string;
  description: string;
}

export interface ConfidenceBreakdown {
  strong: string[];
  needs_verification: string[];
}

export interface DecisionSummary {
  lead_id: number;
  company_name: string;
  fit_score: number | null;
  data_confidence: number;
  priority: string;
  quadrant: 'PRIORITY_TARGETS' | 'VERIFY_FIRST' | 'SECONDARY_OR_LOW' | 'UNVERIFIED_OR_LOW' | 'KNOWN_LOW_FIT' | 'DEPRIORITIZE' | string;
  quadrant_label: string;
  why_this_target: string;
  next_best_action: string;
  verification_gaps: VerificationGap[];
  confidence_breakdown: ConfidenceBreakdown;
}

export interface MatrixPoint {
  id: number;
  company_name: string;
  fit_score: number;
  data_confidence: number;
  priority: string;
  quadrant: 'PRIORITY_TARGETS' | 'VERIFY_FIRST' | 'SECONDARY_OR_LOW' | 'UNVERIFIED_OR_LOW' | 'KNOWN_LOW_FIT' | 'DEPRIORITIZE' | string;
  quadrant_label: string;
  next_best_action: string;
  industry: string | null;
  revenue: number | null;
  employee_count: number | null;
  is_shortlisted: boolean;
}

export interface ResearchQueueItem {
  id: number;
  company_name: string;
  fit_score: number;
  data_confidence: number;
  priority: string;
  quadrant_label: string;
  why_it_matters: string;
  next_action: string;
}

export interface InsightsResponse {
  total_leads: number;
  scored_leads: number;
  unscored_leads: number;
  avg_fit_score: number;
  avg_data_confidence: number;
  priority_targets_count: number;
  verify_first_count: number;
  known_low_fit_count: number;
  deprioritize_count: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  shortlisted_count: number;
  pipeline_insights: string[];
  research_queue: ResearchQueueItem[];
  matrix_points: MatrixPoint[];
}

export interface TargetComparisonItem {
  id: number;
  company_name: string;
  fit_score: number | null;
  data_confidence: number;
  priority: string;
  quadrant_label: string;
  industry: string | null;
  location: string | null;
  revenue: number | null;
  employee_count: number | null;
  founded_year: number | null;
  business_age: number | null;
  decision_maker: string | null;
  decision_maker_title: string | null;
  next_best_action: string;
}

export interface CompareResponse {
  targets: TargetComparisonItem[];
  strongest_fit: string | null;
  best_confidence: string | null;
  needs_most_verification: string | null;
  comparison_notes: string[];
}

export interface AcquisitionBriefResponse {
  lead_id: number;
  company_name: string;
  generated_at: string;
  disclaimer: string;
  target_snapshot: Record<string, any>;
  acquisition_fit: Record<string, any>;
  why_it_ranks: string[];
  verify_before_proceeding: VerificationGap[];
  next_best_action: string;
  source_metadata: Record<string, any>;
}

export interface ImportResult {
  rows_received: number;
  valid_rows: number;
  invalid_rows: number;
  new_records: number;
  existing_matches: number;
  duplicate_rows: number;
  records_inserted: number;
  records_updated: number;
  records_unchanged: number;
  duplicates_found: number;
  rows_imported: number;
  message: string;
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
  is_shortlisted?: boolean;
  search?: string;
}

export type SortField = 'fit_score' | 'data_quality_score' | 'revenue' | 'employee_count' | 'company_name' | 'created_at';
export type SortOrder = 'asc' | 'desc';
