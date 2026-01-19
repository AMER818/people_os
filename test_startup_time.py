
import time
import logging
import os
import sys

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def benchmark_startup():
    logger.info("--- Starting Benchmark ---")
    
    # Measure DB Enforcer
    t0 = time.time()
    try:
        from backend.security.db_enforcer import enforce_clean_db_state
        print("Running enforce_clean_db_state()...")
        enforce_clean_db_state()
    except ImportError:
        logger.error("Could not import db_enforcer")
    except Exception as e:
        logger.error(f"Error in db_enforcer: {e}")
    
    t1 = time.time()
    logger.info(f"✅ DB Enforcer took: {t1 - t0:.4f} seconds")
    
    # Measure Seed Permissions
    t2 = time.time()
    try:
        from backend.seed_permissions import seed_permissions
        print("Running seed_permissions()...")
        seed_permissions()
    except Exception as e:
        logger.error(f"Error in seed_permissions: {e}")
        
    t3 = time.time()
    logger.info(f"✅ Seed Permissions took: {t3 - t2:.4f} seconds")
    
    # Total
    logger.info(f"Total Critical Startup Time: {(t1-t0) + (t3-t2):.4f} seconds")

if __name__ == "__main__":
    benchmark_startup()
