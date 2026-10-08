from sqlalchemy.orm import Session
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadListResponse

repo = LeadRepository()

class LeadService:
    @staticmethod
    def get_leads(db: Session, filters: dict, sort: tuple, page: int, page_size: int):
        skip = (page - 1) * page_size
        items, total = repo.get_all(db, skip, page_size, filters, sort)
        pages = (total + page_size - 1) // page_size
        return LeadListResponse(items=items, page=page, page_size=page_size, total=total, total_pages=pages)
        
    @staticmethod
    def get_lead(db: Session, lead_id: int):
        return repo.get_by_id(db, lead_id)
        
    @staticmethod
    def search_leads(db: Session, query: str, filters: dict, sort: tuple, page: int, page_size: int):
        skip = (page - 1) * page_size
        items, total = repo.search(db, query, skip, page_size, filters, sort)
        pages = (total + page_size - 1) // page_size
        return LeadListResponse(items=items, page=page, page_size=page_size, total=total, total_pages=pages)

    @staticmethod
    def create_lead(db: Session, data: dict):
        return repo.create(db, data)

    @staticmethod
    def update_lead(db: Session, lead_id: int, data: dict):
        return repo.update(db, lead_id, data)

    @staticmethod
    def delete_lead(db: Session, lead_id: int) -> bool:
        lead = repo.get_by_id(db, lead_id)
        if lead:
            db.delete(lead)
            db.commit()
            return True
        return False

    @staticmethod
    def get_stats(db: Session):
        return repo.get_stats(db)

    @staticmethod
    def get_shortlisted(db: Session):
        return repo.get_shortlisted(db)

    @staticmethod
    def set_shortlist(db: Session, lead_id: int, shortlisted: bool):
        return repo.set_shortlist(db, lead_id, shortlisted)
