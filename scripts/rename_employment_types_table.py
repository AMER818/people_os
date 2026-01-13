
import sys
import os
from sqlalchemy import create_engine, text

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import settings

def migrate():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Renaming employment_types table to employment_levels...")
        
        try:
            # check if employment_levels exists
            conn.execute(text("ALTER TABLE employment_types RENAME TO employment_levels;"))
            print("Table renamed successfully.")
            
        except Exception as e:
            print(f"Error renaming table (might already exist or 'employment_types' missing): {e}")
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
