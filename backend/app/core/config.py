import os
from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
_DEFAULT_DB = os.path.join(_BASE_DIR, 'data', 'acquisition_fit.db').replace('\\', '/')

class Settings(BaseSettings):
    DATABASE_URL: str = f'sqlite:///{_DEFAULT_DB}'
    APP_NAME: str = 'Acquisition Fit Workbench'
    APP_VERSION: str = '1.0.0'
    CORS_ORIGINS: list = ['http://localhost:5173', 'http://localhost:3000']
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

def get_settings():
    return Settings()
