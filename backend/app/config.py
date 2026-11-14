from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SkillPath AI Backend"
    environment: str = "production"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    firebase_project_id: str = "storied-backbone-85gvv"
    firebase_credentials_json: str = ""
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    allow_demo_bypass: bool = False

    rate_limit_requests: int = 30
    rate_limit_window_seconds: int = 60
    gemini_timeout_seconds: float = 15.0
    gemini_max_retries: int = 2

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def has_gemini_key(self) -> bool:
        key = self.gemini_api_key.strip()
        return bool(key) and key not in {"MY_GEMINI_API_KEY", "your_gemini_api_key_here"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
