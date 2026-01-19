import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class APIConfig:
    """API Configuration Constants"""
    PROJECT_NAME: str = "PeopleOS API"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("APP_ENV", "development")


class DatabaseConfig:
    """Database Configuration Constants"""
    DATABASE_FILES = {
        "development": "people_os.db",
        "test": "people_os_test.db", 
        "production": "people_os.db",
    }
    DB_FILE = DATABASE_FILES.get(APIConfig.ENVIRONMENT, "people_os.db")
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Construct absolute path for SQLite to avoid CWD issues
    DB_PATH = os.path.join(DATA_DIR, DB_FILE)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{DB_PATH}"
    )


class CorsConfig:
    """CORS Configuration Constants"""
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:8000",
        ).split(",")
    ]


class SystemConfig:
    """System-wide Configuration Constants"""
    STORAGE_QUOTA_MB: float = 5.0
    HEALTH_CHECK_INTERVAL_MS: int = 60000
    RATE_LIMIT_MAX_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_MS: int = 60000
    AUDIT_LOG_RETENTION_DAYS: int = 90


class AuthConfig:
    """Authentication Configuration Constants"""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    LOGIN_RATE_LIMIT: str = "20/minute"
    
    # Import from single source of truth
    from backend.permissions_config import DEFAULT_ROLE_PERMISSIONS
    DEFAULT_PERMISSIONS: dict = DEFAULT_ROLE_PERMISSIONS


# Export instances
api_config = APIConfig()
database_config = DatabaseConfig()
cors_config = CorsConfig()
system_config = SystemConfig()
auth_config = AuthConfig()


class Settings:
    PROJECT_NAME: str = api_config.PROJECT_NAME
    VERSION: str = api_config.VERSION
    PORT: int = api_config.PORT
    ENVIRONMENT: str = api_config.ENVIRONMENT
    DATABASE_URL: str = database_config.DATABASE_URL
    DB_FILE: str = database_config.DB_FILE
    DB_PATH: str = database_config.DB_PATH
    CORS_ORIGINS: list = cors_config.CORS_ORIGINS
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")


settings = Settings()
