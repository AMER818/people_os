import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class APIConfig:
    """API Configuration Constants"""
    PROJECT_NAME: str = "Hunzal HCM API"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("PORT", 3002))
    ENVIRONMENT: str = os.getenv("APP_ENV", "development")

class DatabaseConfig:
    """Database Configuration Constants"""
    DATABASE_FILES = {
        "development": "hunzal_hcm.db",
        "test": "hunzal_hcm_test.db", 
        "production": "hunzal_hcm.db",
    }
    DB_FILE = DATABASE_FILES.get(APIConfig.ENVIRONMENT, "hunzal_hcm.db")
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    os.makedirs(DATA_DIR, exist_ok=True)
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///./backend/data/{DB_FILE}"
    )

class CorsConfig:
    """CORS Configuration Constants"""
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:4173,http://localhost:4040,http://localhost:5000,http://localhost:3000",
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
    
    DEFAULT_PERMISSIONS: dict = {
        "Root": ["*"],
        "SystemAdmin": ["*"],
        "Business Admin": [
            "view_dashboard",
            "manage_employees", "create_employee", "edit_employee", "delete_employee",
            "manage_payroll", "run_payroll", "view_salary",
            "manage_recruitment", "view_candidates", "edit_candidate",
            "view_departments", "manage_master_data",
            "view_reports", "view_audit_logs",
        ],
        "Admin": [
            "view_dashboard",
            "view_employees", "create_employee", "edit_employee",
            "view_payroll", "view_recruitment", "view_departments",
        ],
        "Manager": [
            "view_dashboard", "view_employees", "view_team", "view_leaves",
        ],
        "User": [
            "view_dashboard", "view_profile",
        ]
    }

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
    CORS_ORIGINS: list = cors_config.CORS_ORIGINS

settings = Settings()
