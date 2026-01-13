
import sys
import os
from sqlalchemy import create_engine, text

# Add parent directory to path to import backend modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import settings

def migrate():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking for existing columns...")
        # Check if columns exist to avoid errors
        # This is a basic check; valid for SQLite. For Postgres, use information_schema.
        
        try:
            # SQLite Syntax
            conn.execute(text("ALTER TABLE hr_plants ADD COLUMN head_of_plant VARCHAR;"))
            print("Added column: head_of_plant")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("Column 'head_of_plant' already exists.")
            else:
                print(f"Error adding 'head_of_plant': {e}")

        try:
            # SQLite Syntax
            conn.execute(text("ALTER TABLE hr_plants ADD COLUMN contact_number VARCHAR;"))
            print("Added column: contact_number")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("Column 'contact_number' already exists.")
            else:
                print(f"Error adding 'contact_number': {e}")
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
