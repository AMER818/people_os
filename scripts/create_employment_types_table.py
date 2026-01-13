
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
        print("Creating employment_types table...")
        
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS employment_types (
            id VARCHAR PRIMARY KEY,
            name VARCHAR,
            code VARCHAR,
            description VARCHAR,
            is_active BOOLEAN DEFAULT 1,
            organization_id VARCHAR,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            created_by VARCHAR,
            updated_by VARCHAR,
            FOREIGN KEY(organization_id) REFERENCES organizations(id),
            CONSTRAINT uq_employment_types_name UNIQUE (name),
            CONSTRAINT uq_employment_types_code UNIQUE (code)
        );
        """
        
        try:
            conn.execute(text(create_table_sql))
            print("Table 'employment_types' created successfully.")
            
            # Create Indices
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_employment_types_id ON employment_types (id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_employment_types_name ON employment_types (name);"))
            print("Indices created.")
            
        except Exception as e:
            print(f"Error creating table: {e}")
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
