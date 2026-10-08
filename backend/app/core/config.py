from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./data/acquisition_fit.db'
    APP_NAME: str = 'Acquisition Fit Workbench'
    APP_VERSION: str = '1.0.0'
    CORS_ORIGINS: list = ['http://localhost:5173', 'http://localhost:3000']
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

def get_settings():
    return Settings()
