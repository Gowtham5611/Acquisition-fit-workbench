from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get('/api/health')
def health_check():
    return {'status': 'healthy', 'version': settings.APP_VERSION}
