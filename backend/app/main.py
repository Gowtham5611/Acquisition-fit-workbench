import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.models.lead import Base
from app.models.database import engine
from app.api.routes import health, leads, import_export, stats, scoring, decision

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description='Turn raw company leads into an actionable acquisition pipeline.'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Create data directories
os.makedirs('data/demo', exist_ok=True)
os.makedirs('data/imports', exist_ok=True)

# Include routers - import_export, scoring, and decision MUST precede leads so /api/leads/export, /api/leads/score,
# and /api/leads/compare are evaluated before the parameterized route /api/leads/{lead_id}
app.include_router(health.router)
app.include_router(import_export.router)
app.include_router(scoring.router)
app.include_router(decision.router)
app.include_router(stats.router)
app.include_router(leads.router)
