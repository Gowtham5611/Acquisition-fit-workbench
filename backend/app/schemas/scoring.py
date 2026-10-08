from pydantic import BaseModel
from typing import List, Optional, Union
from .lead import LeadBase

class ICPConfig(BaseModel):
    target_industries: List[str] = []
    target_locations: List[str] = []
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    min_revenue: Optional[float] = None
    max_revenue: Optional[float] = None
    min_years: Optional[int] = None
    max_years: Optional[int] = None
    decision_maker_preferred: bool = False
    website_preferred: bool = False
    exclusion_keywords: List[str] = []

class ScoreBreakdown(BaseModel):
    industry: float = 0.0
    geography: float = 0.0
    revenue: float = 0.0
    employees: float = 0.0
    business_age: float = 0.0
    decision_maker: float = 0.0
    data_completeness: float = 0.0
    website: float = 0.0

class ScoreResult(BaseModel):
    score: int
    priority: str
    breakdown: ScoreBreakdown
    positive_signals: List[str]
    negative_signals: List[str]

class ScoreRequest(BaseModel):
    icp: ICPConfig

class ScorePreviewRequest(BaseModel):
    icp: ICPConfig
    lead: Union[LeadBase, dict]
