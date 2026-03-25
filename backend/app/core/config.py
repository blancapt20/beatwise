from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )
    
    # App
    app_name: str = "BeatWise"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # File Upload
    max_upload_size: int = 52428800  # 50 MB
    max_files_per_session: int = 200
    allowed_extensions: List[str] = [".mp3", ".wav", ".flac"]
    
    # Temp Storage
    temp_dir: str = "C:/temp/beatwise"
    session_timeout_hours: int = 1
    processing_workers: int = 4
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]


# Global settings instance
settings = Settings()
