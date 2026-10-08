import csv
import io
from sqlalchemy.orm import Session
from app.repositories.lead_repository import LeadRepository
import json
from datetime import datetime

repo = LeadRepository()

def export_leads(db: Session, filters: dict, sort: tuple) -> str:
    leads, _ = repo.get_all(db, skip=0, limit=1000000, filters=filters, sort=sort)
    
    output = io.StringIO()
    fields = [
        'Company', 'Industry', 'Location', 'Revenue', 'Employees', 
        'Business Age', 'Decision Maker', 'Fit Score', 'Priority', 
        'Data Quality', 'Score Reasons', 'Source'
    ]
    
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    
    current_year = datetime.now().year
    
    for l in leads:
        location = f"{l.city or ''}, {l.state or ''}".strip(', ')
        rev = f"${l.revenue:,.0f}" if l.revenue is not None else ""
        emp = str(l.employee_count) if l.employee_count is not None else ""
        age = f"{current_year - l.founded_year} yrs" if l.founded_year else ""
        
        reasons_list = []
        if l.score_reasons:
            try:
                data = json.loads(l.score_reasons)
                if isinstance(data, dict):
                    pos = data.get('positive', [])
                    neg = data.get('negative', [])
                    reasons_list = [f"[+] {p}" for p in pos] + [f"[-] {n}" for n in neg]
                elif isinstance(data, list):
                    reasons_list = data
            except Exception:
                reasons_list = [str(l.score_reasons)]
        reasons = " | ".join(reasons_list)
                
        writer.writerow({
            'Company': l.company_name or "",
            'Industry': l.industry or "",
            'Location': location,
            'Revenue': rev,
            'Employees': emp,
            'Business Age': age,
            'Decision Maker': l.owner_name or "",
            'Fit Score': str(int(l.fit_score or 0)),
            'Priority': l.priority or "LOW",
            'Data Quality': f"{int(l.data_quality_score or 0)}%",
            'Score Reasons': reasons,
            'Source': l.source or "Unknown"
        })
        
    return output.getvalue()
