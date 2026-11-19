import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "RecoLab"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # MongoDB Atlas
    MONGODB_URI: str = "mongodb+srv://devops_db_user:FmSuxxKg4ZYRomyt@cluster0.bsyn8gp.mongodb.net/recolab_db?retryWrites=true&w=majority"
    MONGODB_DB_NAME: str = "recolab_db"

    # Security & JWT
    JWT_SECRET_KEY: str = "recolab_super_secret_jwt_key_2026_secure_hash_x9a8f7e6d5c4b3a2"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Directories
    UPLOAD_DIRECTORY: str = "./uploads"
    MODEL_STORAGE_DIRECTORY: str = "./models_storage"
    REPORTS_DIRECTORY: str = "./reports_storage"

    # ML Defaults
    DEFAULT_SIMILARITY_THRESHOLD: float = 0.15
    DEFAULT_TOP_K: int = 10
    DEFAULT_CONTENT_WEIGHT: float = 0.5
    DEFAULT_INTERACTION_WEIGHT: float = 0.5
    TFIDF_MAX_FEATURES: int = 5000

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()

# Ensure required directories exist
for path in [settings.UPLOAD_DIRECTORY, settings.MODEL_STORAGE_DIRECTORY, settings.REPORTS_DIRECTORY]:
    os.makedirs(path, exist_ok=True)
