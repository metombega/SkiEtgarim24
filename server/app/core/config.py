from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI MongoDB Project"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "fastapi_db"

    class Config:
        case_sensitive = True


settings = Settings()
