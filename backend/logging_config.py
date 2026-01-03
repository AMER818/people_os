import logging
import os
import sys

# Ensure we can find the config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.config import settings
except ImportError:
    # Fallback if running from root
    from config import settings


def configure_logging():
    """
    Configure structured logging for the application.
    Uses generic logging for now, upgradeable to JSON later.
    """
    log_level = logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO

    # Create Logger
    logger = logging.getLogger("hunzal_hcm")
    logger.setLevel(log_level)

    # Handler (Console)
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    # Formatter
    if settings.ENVIRONMENT == "production":
        try:
            from pythonjsonlogger import jsonlogger
            formatter = jsonlogger.JsonFormatter(
                "%(asctime)s %(name)s %(levelname)s %(message)s %(filename)s %(lineno)d"
            )
        except ImportError:
            # Fallback if dependency missing
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
            
    handler.setFormatter(formatter)

    # Add Handler if not present
    if not logger.handlers:
        logger.addHandler(handler)

    return logger


# Global instance
logger = configure_logging()
