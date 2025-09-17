from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "postgresql://username:password@localhost:5432/loan_crm"
    secret_key: str = "your-secret-key-here-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    gemini_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
