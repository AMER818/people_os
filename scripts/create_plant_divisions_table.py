
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
        print("Creating plant_divisions table...")
        
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS plant_divisions (
            id VARCHAR PRIMARY KEY,
            plant_id VARCHAR,
            name VARCHAR,
            code VARCHAR,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            created_by VARCHAR,
            updated_by VARCHAR,
            FOREIGN KEY(plant_id) REFERENCES hr_plants(id) ON DELETE CASCADE,
            CONSTRAINT uq_plant_divisions_name UNIQUE (name),
            CONSTRAINT uq_plant_divisions_code UNIQUE (code)
        );
        """
        
        try:
            conn.execute(text(create_table_sql))
            print("Table 'plant_divisions' created successfully.")
            
            # Create Indices
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_plant_divisions_id ON plant_divisions (id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_plant_divisions_plant_id ON plant_divisions (plant_id);"))
            print("Indices created.")
            
        except Exception as e:
            print(f"Error creating table: {e}")
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
