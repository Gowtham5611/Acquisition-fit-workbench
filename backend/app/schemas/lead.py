from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
import json
from datetime import datetime

class LeadBase(BaseModel):
    company_name: str
    website: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    employee_count: Optional[int] = None
    revenue: Optional[float] = None
    founded_year: Optional[int] = None
    owner_name: Optional[str] = None
    owner_title: Optional[str] = None
    owner_email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class ScoreReasons(BaseModel):
    positive: List[str] = []
    negative: List[str] = []

class LeadResponse(LeadBase):
    id: int
    data_quality_score: Optional[float] = 0.0
    fit_score: Optional[float] = 0.0
    priority: Optional[str] = 'LOW'
    score_breakdown: Optional[Dict[str, float]] = None
    score_reasons: Optional[ScoreReasons] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

    @field_validator('score_breakdown', mode='before')
    @classmethod
    def parse_breakdown(cls, v: Any):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v

    @field_validator('score_reasons', mode='before')
    @classmethod
    def parse_reasons(cls, v: Any):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return {"positive": parsed, "negative": []}
                if isinstance(parsed, dict):
                    return parsed
                return {"positive": [], "negative": []}
            except Exception:
                return {"positive": [], "negative": []}
        if isinstance(v, list):
            return {"positive": v, "negative": []}
        return v

class LeadDetailResponse(LeadResponse):
    pass

class LeadListResponse(BaseModel):
    items: List[LeadResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
