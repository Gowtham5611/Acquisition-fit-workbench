from sqlalchemy.orm import Session
from typing import List, Optional, Tuple, Dict, Any
from app.models.lead import Lead
from sqlalchemy import or_, and_, desc, asc, func

class LeadRepository:
    def get_all(self, db: Session, skip: int = 0, limit: int = 20, filters: dict = None, sort: tuple = None) -> Tuple[List[Lead], int]:
        q = db.query(Lead)
        if filters:
            # Full-text search across multiple fields
            search_query = filters.get('search')
            if search_query and str(search_query).strip():
                term = f"%{str(search_query).strip()}%"
                q = q.filter(
                    or_(
                        Lead.company_name.ilike(term),
                        Lead.domain.ilike(term),
                        Lead.industry.ilike(term),
                        Lead.city.ilike(term),
                        Lead.state.ilike(term),
                        Lead.owner_name.ilike(term)
                    )
                )

            # Priority filter
            priority = filters.get('priority')
            if priority:
                if priority == 'UNSCORED':
                    q = q.filter(or_(Lead.fit_score == None, Lead.fit_score == 0))
                else:
                    q = q.filter(Lead.priority == priority)

            if filters.get('industry'):
                q = q.filter(Lead.industry.ilike(f"%{filters['industry']}%"))
            if filters.get('state'):
                q = q.filter(Lead.state.ilike(f"%{filters['state']}%"))
            if filters.get('min_score') is not None:
                q = q.filter(Lead.fit_score >= float(filters['min_score']))
            if filters.get('max_score') is not None:
                q = q.filter(Lead.fit_score <= float(filters['max_score']))
            if filters.get('min_revenue') is not None:
                q = q.filter(Lead.revenue >= float(filters['min_revenue']))
            if filters.get('max_revenue') is not None:
                q = q.filter(Lead.revenue <= float(filters['max_revenue']))
            if filters.get('min_employees') is not None:
                q = q.filter(Lead.employee_count >= int(filters['min_employees']))
            if filters.get('max_employees') is not None:
                q = q.filter(Lead.employee_count <= int(filters['max_employees']))
            if filters.get('min_data_quality') is not None:
                q = q.filter(Lead.data_quality_score >= float(filters['min_data_quality']))
            if filters.get('has_email'):
                q = q.filter(and_(Lead.owner_email != None, Lead.owner_email != ''))
            if filters.get('has_website'):
                q = q.filter(and_(Lead.website != None, Lead.website != ''))
            if filters.get('has_decision_maker'):
                q = q.filter(and_(Lead.owner_name != None, Lead.owner_name != ''))
            if filters.get('is_shortlisted') is not None:
                shortlist_val = 1 if filters['is_shortlisted'] else 0
                q = q.filter(Lead.is_shortlisted == shortlist_val)
            
        total = q.count()
        
        if sort:
            sort_field, sort_order = sort
            col = getattr(Lead, sort_field, None)
            if col:
                q = q.order_by(desc(col) if sort_order == 'desc' else asc(col))
            else:
                q = q.order_by(desc(Lead.fit_score), desc(Lead.id))
        else:
            q = q.order_by(desc(Lead.fit_score), desc(Lead.id))
            
        return q.offset(skip).limit(limit).all(), total

    def get_by_id(self, db: Session, lead_id: int) -> Optional[Lead]:
        return db.query(Lead).filter(Lead.id == lead_id).first()

    def get_by_domain(self, db: Session, domain: str) -> Optional[Lead]:
        if not domain:
            return None
        return db.query(Lead).filter(func.lower(Lead.domain) == domain.lower()).first()

    def get_by_name_and_state(self, db: Session, name: str, state: str) -> Optional[Lead]:
        if not name:
            return None
        return db.query(Lead).filter(func.lower(Lead.company_name) == name.lower(), func.lower(Lead.state) == (state or '').lower()).first()

    def create(self, db: Session, lead_data: dict) -> Lead:
        writable_cols = {c.name for c in Lead.__table__.columns} - {'id', 'created_at', 'updated_at'}
        clean_data = {k: v for k, v in lead_data.items() if k in writable_cols}
        lead = Lead(**clean_data)
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return lead
        
    def update(self, db: Session, lead_id: int, data: dict) -> Optional[Lead]:
        lead = self.get_by_id(db, lead_id)
        if lead:
            writable_cols = {c.name for c in Lead.__table__.columns} - {'id', 'created_at', 'updated_at'}
            for k, v in data.items():
                if k in writable_cols and hasattr(lead, k):
                    setattr(lead, k, v)
            db.commit()
            db.refresh(lead)
        return lead

    def get_shortlisted(self, db: Session) -> List[Lead]:
        return db.query(Lead).filter(Lead.is_shortlisted == 1).order_by(desc(Lead.fit_score), desc(Lead.id)).all()

    def set_shortlist(self, db: Session, lead_id: int, shortlisted: bool) -> Optional[Lead]:
        lead = self.get_by_id(db, lead_id)
        if lead:
            lead.is_shortlisted = 1 if shortlisted else 0
            db.commit()
            db.refresh(lead)
        return lead

    def bulk_create(self, db: Session, leads_data: List[dict]) -> List[Lead]:
        writable_cols = {c.name for c in Lead.__table__.columns} - {'id', 'created_at', 'updated_at'}
        leads = [Lead(**{k: v for k, v in data.items() if k in writable_cols}) for data in leads_data]
        db.add_all(leads)
        db.commit()
        for lead in leads:
            db.refresh(lead)
        return leads

    def search(self, db: Session, query: str, skip: int = 0, limit: int = 20, filters: dict = None, sort: tuple = None) -> Tuple[List[Lead], int]:
        combined_filters = dict(filters or {})
        if query:
            combined_filters['search'] = query
        return self.get_all(db, skip=skip, limit=limit, filters=combined_filters, sort=sort)

    def get_stats(self, db: Session) -> dict:
        total = db.query(Lead).count()
        high = db.query(Lead).filter(Lead.priority == 'HIGH').count()
        medium = db.query(Lead).filter(Lead.priority == 'MEDIUM').count()
        low = db.query(Lead).filter(Lead.priority == 'LOW').count()
        unscored = db.query(Lead).filter(or_(Lead.priority == 'UNSCORED', Lead.priority == None, Lead.fit_score == None)).count()
        
        # Ensure exact count partition invariant: total == high + medium + low + unscored
        scored = high + medium + low

        avg_score_query = db.query(func.avg(Lead.fit_score)).filter(Lead.fit_score != None).scalar()
        avg_score = float(avg_score_query) if avg_score_query is not None else 0.0

        avg_dq_query = db.query(func.avg(Lead.data_quality_score)).scalar()
        avg_dq = float(avg_dq_query) if avg_dq_query is not None else 0.0

        shortlisted = db.query(Lead).filter(Lead.is_shortlisted == 1).count()
        
        return {
            "total_leads": total,
            "high_priority": high,
            "medium_priority": medium,
            "low_priority": low,
            "unscored_leads": unscored,
            "scored_leads": scored,
            "shortlisted_leads": shortlisted,
            "avg_fit_score": round(avg_score, 1),
            "avg_data_quality": round(avg_dq, 1),
        }
