from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.lead_service import LeadService
from app.schemas.lead import LeadListResponse, LeadDetailResponse
from typing import Optional

router = APIRouter()

@router.get('/api/leads', response_model=LeadListResponse)
def get_leads(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    priority: Optional[str] = None,
    industry: Optional[str] = None,
    state: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    min_revenue: Optional[float] = None,
    max_revenue: Optional[float] = None,
    min_employees: Optional[int] = None,
    max_employees: Optional[int] = None,
    min_data_quality: Optional[float] = None,
    has_email: Optional[bool] = None,
    has_website: Optional[bool] = None,
    has_decision_maker: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = 'desc',
    search: Optional[str] = None
):
    filters = {
        'priority': priority, 'industry': industry, 'state': state,
        'min_score': min_score, 'max_score': max_score,
        'min_revenue': min_revenue, 'max_revenue': max_revenue,
        'min_employees': min_employees, 'max_employees': max_employees,
        'min_data_quality': min_data_quality, 'has_email': has_email,
        'has_website': has_website, 'has_decision_maker': has_decision_maker
    }
    # Clean None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    sort = (sort_by, sort_order) if sort_by else None
    
    if search:
        return LeadService.search_leads(db, search, filters, sort, page, page_size)
    
    return LeadService.get_leads(db, filters, sort, page, page_size)

@router.get('/api/leads/{lead_id}', response_model=LeadDetailResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = LeadService.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post('/api/leads/search', response_model=LeadListResponse)
def search_leads_post(
    body: dict,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = body.get('query', '')
    filters = body.get('filters', {})
    sort_by = body.get('sort_by')
    sort_order = body.get('sort_order', 'desc')
    sort = (sort_by, sort_order) if sort_by else None
    return LeadService.search_leads(db, query, filters, sort, page, page_size)
