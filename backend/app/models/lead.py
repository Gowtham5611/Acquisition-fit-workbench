from sqlalchemy import Column, Integer, String, Float, DateTime, Index, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Lead(Base):
    __tablename__ = 'leads'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String, nullable=False, index=True)
    website = Column(String, nullable=True)
    domain = Column(String, nullable=True, index=True)
    industry = Column(String, nullable=True, index=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True, index=True)
    country = Column(String, nullable=True)
    employee_count = Column(Integer, nullable=True)
    revenue = Column(Float, nullable=True)
    founded_year = Column(Integer, nullable=True)
    owner_name = Column(String, nullable=True)
    owner_title = Column(String, nullable=True)
    owner_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    source = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    data_quality_score = Column(Float, nullable=True, default=0)
    fit_score = Column(Float, nullable=True, default=0)
    priority = Column(String, nullable=True, default='LOW')
    score_breakdown = Column(String, nullable=True)  # JSON string
    score_reasons = Column(String, nullable=True)  # JSON string
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('ix_leads_fit_score', 'fit_score'),
        Index('ix_leads_priority', 'priority'),
        Index('ix_leads_revenue', 'revenue'),
        Index('ix_leads_employee_count', 'employee_count'),
        Index('ix_leads_data_quality_score', 'data_quality_score'),
    )
