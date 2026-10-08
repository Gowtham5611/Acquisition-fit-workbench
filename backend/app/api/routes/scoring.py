from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
from app.models.database import get_db
from app.schemas.scoring import ScoreRequest, ScorePreviewRequest, ScoreResult
from app.services.scoring_service import score_all_leads, calculate_fit_score
from app.repositories.lead_repository import LeadRepository

from app.services.decision_service import DecisionService

router = APIRouter()
repo = LeadRepository()

@router.post('/api/leads/score')
def score_leads(request: ScoreRequest, db: Session = Depends(get_db)):
    leads, _ = repo.get_all(db, 0, 1000000)
    results = score_all_leads(leads, request.icp)
    
    scored_count = 0
    for res in results:
        lead = res['lead']
        score_res = res['score_result']
        dq = res['data_quality']
        
        lead_dict = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
        next_action = DecisionService.determine_next_best_action(
            lead_dict,
            score_res.score,
            dq,
            score_res.negative_signals
        )
        
        repo.update(db, lead.id, {
            'fit_score': score_res.score,
            'priority': score_res.priority,
            'score_breakdown': json.dumps(score_res.breakdown.model_dump()),
            'score_reasons': json.dumps({
                'positive': score_res.positive_signals,
                'negative': score_res.negative_signals
            }),
            'data_quality_score': dq,
            'next_best_action': next_action
        })
        scored_count += 1
        
    return {"message": "Leads scored successfully", "scored_count": scored_count}

@router.post('/api/score/preview', response_model=ScoreResult)
def preview_score(request: ScorePreviewRequest):
    lead_dict = request.lead if isinstance(request.lead, dict) else request.lead.model_dump()
    return calculate_fit_score(lead_dict, request.icp)
