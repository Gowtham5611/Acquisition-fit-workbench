from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class VerificationGap(BaseModel):
    priority: str  # HIGH, MEDIUM, LOW
    field: str
    label: str
    description: str

class ConfidenceBreakdown(BaseModel):
    strong: List[str]
    needs_verification: List[str]

class DecisionSummaryResponse(BaseModel):
    lead_id: int
    company_name: str
    fit_score: Optional[float]
    data_confidence: float
    priority: str
    quadrant: str
    quadrant_label: str
    why_this_target: str
    next_best_action: str
    verification_gaps: List[VerificationGap]
    confidence_breakdown: ConfidenceBreakdown

class CompareRequest(BaseModel):
    lead_ids: List[int]

class TargetComparisonItem(BaseModel):
    id: int
    company_name: str
    fit_score: Optional[float]
    data_confidence: float
    priority: str
    quadrant_label: str
    industry: Optional[str]
    location: Optional[str]
    revenue: Optional[float]
    employee_count: Optional[int]
    founded_year: Optional[int]
    business_age: Optional[int]
    decision_maker: Optional[str]
    decision_maker_title: Optional[str]
    next_best_action: str

class CompareResponse(BaseModel):
    targets: List[TargetComparisonItem]
    strongest_fit: Optional[str]
    best_confidence: Optional[str]
    needs_most_verification: Optional[str]
    comparison_notes: List[str]

class AcquisitionBriefResponse(BaseModel):
    lead_id: int
    company_name: str
    generated_at: str
    disclaimer: str
    target_snapshot: Dict[str, Any]
    acquisition_fit: Dict[str, Any]
    why_it_ranks: List[str]
    verify_before_proceeding: List[VerificationGap]
    next_best_action: str
    source_metadata: Dict[str, Any]

class MatrixPoint(BaseModel):
    id: int
    company_name: str
    fit_score: float
    data_confidence: float
    priority: str
    quadrant: str
    quadrant_label: str
    next_best_action: str
    industry: Optional[str]
    revenue: Optional[float]
    employee_count: Optional[int]
    is_shortlisted: bool

class ResearchQueueItem(BaseModel):
    id: int
    company_name: str
    fit_score: float
    data_confidence: float
    priority: str
    quadrant_label: str
    why_it_matters: str
    next_action: str

class InsightsResponse(BaseModel):
    total_leads: int
    scored_leads: int
    unscored_leads: int
    avg_fit_score: float
    avg_data_confidence: float
    priority_targets_count: int  # High Fit + High Conf
    verify_first_count: int      # High Fit + Low Conf
    known_low_fit_count: int     # Lower Fit (<80) + High Conf (legacy field alias)
    deprioritize_count: int      # Lower Fit (<80) + Low Conf (legacy field alias)
    secondary_or_low_count: Optional[int] = None   # Lower Fit (<80) + High Conf
    unverified_or_low_count: Optional[int] = None  # Lower Fit (<80) + Low Conf
    high_priority_count: int
    medium_priority_count: int
    low_priority_count: int
    shortlisted_count: int
    pipeline_insights: List[str]
    research_queue: List[ResearchQueueItem]
    matrix_points: List[MatrixPoint]
