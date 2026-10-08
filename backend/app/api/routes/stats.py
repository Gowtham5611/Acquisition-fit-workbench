from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.lead_service import LeadService

router = APIRouter()

@router.get('/api/stats')
def get_stats(db: Session = Depends(get_db)):
    return LeadService.get_stats(db)
