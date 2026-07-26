from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GCI Platform API"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "default-insecure-key-for-scaffolding"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    # Database URIs
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "gci_db"
    
    TIMESCALEDB_SERVER: str = "localhost"
    TIMESCALEDB_USER: str = "postgres"
    TIMESCALEDB_PASSWORD: str = "postgres"
    TIMESCALEDB_DB: str = "gci_tsdb"
    
    # Redis
    REDIS_URI: str = "redis://localhost:6379/0"
    
    # Kafka
    KAFKA_BROKER_URL: str = "localhost:9092"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
