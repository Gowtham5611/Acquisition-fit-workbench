from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.lead import Lead
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadResponse
from app.schemas.decision import (
    DecisionSummaryResponse, CompareRequest, CompareResponse,
    AcquisitionBriefResponse, InsightsResponse, MatrixPoint, ResearchQueueItem
)
from app.services.decision_service import DecisionService

router = APIRouter()
repo = LeadRepository()

@router.get('/api/insights', response_model=InsightsResponse)
def get_insights(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    stats = repo.get_stats(db)

    matrix_points: List[MatrixPoint] = []
    pt_count = 0
    vf_count = 0
    kl_count = 0
    dp_count = 0

    rev_missing_count = 0
    has_rev_count = 0

    scored_leads_list: List[Lead] = []

    for l in leads:
        ld = {c.name: getattr(l, c.name) for c in l.__table__.columns}
        conf = l.data_quality_score or DecisionService.calculate_data_confidence(ld)
        fit = l.fit_score

        if l.revenue is None or str(l.revenue).strip() == '':
            rev_missing_count += 1
        else:
            has_rev_count += 1

        if fit is not None:
            scored_leads_list.append(l)
            q, q_label = DecisionService.determine_quadrant(fit, conf)
            if q == "PRIORITY_TARGETS":
                pt_count += 1
            elif q == "VERIFY_FIRST":
                vf_count += 1
            elif q == "KNOWN_LOW_FIT":
                kl_count += 1
            else:
                dp_count += 1

            next_action = l.next_best_action or DecisionService.determine_next_best_action(ld, fit, conf)

            matrix_points.append(MatrixPoint(
                id=l.id,
                company_name=l.company_name,
                fit_score=float(fit),
                data_confidence=conf,
                priority=l.priority or 'LOW',
                quadrant=q,
                quadrant_label=q_label,
                next_best_action=next_action,
                industry=l.industry,
                revenue=l.revenue,
                employee_count=l.employee_count,
                is_shortlisted=bool(l.is_shortlisted)
            ))

    # Top 5 Research Queue items: sorted by fit_score desc, then confidence desc
    scored_leads_list.sort(key=lambda x: (x.fit_score or 0.0, x.data_quality_score or 0.0), reverse=True)
    top_5 = scored_leads_list[:5]

    research_queue: List[ResearchQueueItem] = []
    for l in top_5:
        ld = {c.name: getattr(l, c.name) for c in l.__table__.columns}
        conf = l.data_quality_score or DecisionService.calculate_data_confidence(ld)
        fit = l.fit_score or 0.0
        _, q_label = DecisionService.determine_quadrant(fit, conf)
        why_text = DecisionService.generate_why_this_target(ld, fit, conf)
        next_act = l.next_best_action or DecisionService.determine_next_best_action(ld, fit, conf)

        research_queue.append(ResearchQueueItem(
            id=l.id,
            company_name=l.company_name,
            fit_score=float(fit),
            data_confidence=conf,
            priority=l.priority or 'HIGH',
            quadrant_label=q_label,
            why_it_matters=why_text,
            next_action=next_act
        ))

    # Deterministic narrative insights based strictly on dataset statistics
    total = stats['total_leads']
    pipeline_insights: List[str] = []

    if total > 0:
        high_cnt = stats['high_priority']
        pipeline_insights.append(f"{high_cnt} targets currently meet the HIGH fit threshold (>= 80/100).")
        pipeline_insights.append(f"{vf_count} high-fit candidates require data verification before outreach.")
        
        rev_pct = round((has_rev_count / total) * 100)
        pipeline_insights.append(f"{rev_pct}% of leads have confirmed revenue recorded in the current dataset.")

        if rev_missing_count > 0:
            missing_pct = round((rev_missing_count / total) * 100)
            pipeline_insights.append(f"Revenue is unconfirmed for {missing_pct}% of records; verify during pre-diligence.")
        
        if pt_count > 0:
            pipeline_insights.append(f"{pt_count} companies are ready for active sourcing in the 'Priority Targets' quadrant.")
    else:
        pipeline_insights.append("No company records imported. Load demo dataset or upload CSV to begin.")

    return InsightsResponse(
        total_leads=stats['total_leads'],
        scored_leads=stats['scored_leads'],
        unscored_leads=stats['unscored_leads'],
        avg_fit_score=stats['avg_fit_score'],
        avg_data_confidence=stats['avg_data_quality'],
        priority_targets_count=pt_count,
        verify_first_count=vf_count,
        known_low_fit_count=kl_count,
        deprioritize_count=dp_count,
        high_priority_count=stats['high_priority'],
        medium_priority_count=stats['medium_priority'],
        low_priority_count=stats['low_priority'],
        shortlisted_count=stats['shortlisted_leads'],
        pipeline_insights=pipeline_insights,
        research_queue=research_queue,
        matrix_points=matrix_points
    )

@router.get('/api/leads/{lead_id}/decision-summary', response_model=DecisionSummaryResponse)
def get_decision_summary(lead_id: int, db: Session = Depends(get_db)):
    lead = repo.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return DecisionService.get_decision_summary(lead)

@router.post('/api/leads/compare', response_model=CompareResponse)
def compare_leads(request: CompareRequest, db: Session = Depends(get_db)):
    if len(request.lead_ids) < 2 or len(request.lead_ids) > 3:
        raise HTTPException(
            status_code=400,
            detail="Comparison requires exactly 2 or 3 target company IDs."
        )

    leads = db.query(Lead).filter(Lead.id.in_(request.lead_ids)).all()
    if len(leads) != len(request.lead_ids):
        raise HTTPException(status_code=404, detail="One or more target leads could not be found.")

    return DecisionService.compare_targets(leads)

@router.get('/api/shortlist', response_model=List[LeadResponse])
def get_shortlist(db: Session = Depends(get_db)):
    return repo.get_shortlisted(db)

@router.post('/api/shortlist/{lead_id}', response_model=LeadResponse)
def add_to_shortlist(lead_id: int, db: Session = Depends(get_db)):
    lead = repo.set_shortlist(db, lead_id, True)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.delete('/api/shortlist/{lead_id}', response_model=LeadResponse)
def remove_from_shortlist(lead_id: int, db: Session = Depends(get_db)):
    lead = repo.set_shortlist(db, lead_id, False)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.get('/api/brief/{lead_id}', response_model=AcquisitionBriefResponse)
def get_acquisition_brief(lead_id: int, db: Session = Depends(get_db)):
    lead = repo.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return DecisionService.generate_acquisition_brief(lead)

