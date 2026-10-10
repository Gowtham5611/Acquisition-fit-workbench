import csv
import logging
import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.responses import PlainTextResponse
from typing import Optional
from app.models.database import get_db
from app.services.import_service import import_csv, load_demo_data
from app.services.export_service import export_leads
from app.schemas.import_export import ImportResult

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post('/api/leads/import', response_model=ImportResult)
async def import_leads_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    content = await file.read()
    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty")
    try:
        decoded_content = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        try:
            decoded_content = content.decode('latin-1')
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to decode CSV file format")
    try:
        return import_csv(db, decoded_content, file.filename)
    except csv.Error as ce:
        logger.warning(f"Malformed CSV uploaded: {file.filename} - {str(ce)}")
        raise HTTPException(status_code=400, detail=f"Malformed CSV format: {str(ce)}")
    except Exception as e:
        logger.error(f"Error importing CSV {file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Failed to process CSV file. Ensure valid headers and structure.")

@router.get('/api/leads/export', response_class=PlainTextResponse)
def export_leads_csv(
    db: Session = Depends(get_db),
    priority: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    min_revenue: Optional[float] = Query(None),
    max_revenue: Optional[float] = Query(None),
    min_employees: Optional[int] = Query(None),
    max_employees: Optional[int] = Query(None),
    min_data_quality: Optional[float] = Query(None),
    has_email: Optional[bool] = Query(None),
    has_website: Optional[bool] = Query(None),
    has_decision_maker: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query('desc'),
    search: Optional[str] = Query(None)
):
    filters = {
        'priority': priority, 'industry': industry, 'state': state,
        'min_score': min_score, 'max_score': max_score,
        'min_revenue': min_revenue, 'max_revenue': max_revenue,
        'min_employees': min_employees, 'max_employees': max_employees,
        'min_data_quality': min_data_quality, 'has_email': has_email,
        'has_website': has_website, 'has_decision_maker': has_decision_maker,
        'search': search
    }
    filters = {k: v for k, v in filters.items() if v is not None}
    sort = (sort_by, sort_order) if sort_by else None
    csv_str = export_leads(db, filters, sort)
    return PlainTextResponse(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=acquisition_fit_leads.csv"}
    )

@router.post('/api/leads/load-demo', response_model=ImportResult)
def load_demo(db: Session = Depends(get_db)):
    possible_paths = [
        os.path.join('data', 'demo', 'demo_leads.csv'),
        os.path.join('..', 'data', 'demo', 'demo_leads.csv'),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'data', 'demo', 'demo_leads.csv')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'demo', 'demo_leads.csv')),
    ]
    demo_path = None
    for p in possible_paths:
        if os.path.exists(p):
            demo_path = p
            break
            
    if not demo_path:
        raise HTTPException(status_code=404, detail="Demo file data/demo/demo_leads.csv not found")
        
    return load_demo_data(db, demo_path)
