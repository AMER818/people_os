import sys
import os

# Add backend to path to import models
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')) # Add root to path
# But actually we need backend folder in path to import backend.database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.database import engine
except ImportError:
    from database import engine

from sqlalchemy import inspect

def inspect_db():
    output_file = r"C:\Users\AAmir.Javed\.gemini\antigravity\brain\33364b68-71b7-448e-afc4-d54a5606a79e\schema_verification_report.md"
    
    inspector = inspect(engine)
    tables = [
        "organizations", 
        "hr_plants", 
        "plant_divisions",
        "departments", 
        "employment_levels",
        "grades", 
        "designations"
    ]
    
    with open(output_file, "w") as f:
        f.write("# Database Schema Verification Report\n\n")
        
        for table in tables:
            if not inspector.has_table(table):
                f.write(f"❌ **Table '{table}' NOT FOUND**\n\n")
                continue

            f.write(f"## Table: `{table}`\n")
            
            # Check Columns
            columns = inspector.get_columns(table)
            col_names = [c['name'] for c in columns]
            f.write(f"- **Columns**: {', '.join(col_names)}\n")

            # Check Foreign Keys
            fks = inspector.get_foreign_keys(table)
            if fks:
                f.write("- **Foreign Keys**:\n")
                for fk in fks:
                    # Handle composite keys safely (though typically single list)
                    constrained = fk['constrained_columns']
                    referred_table = fk['referred_table']
                    referred_cols = fk['referred_columns']
                    f.write(f"  - `{constrained}` -> `{referred_table}.{referred_cols}`\n")
            else:
                f.write("- **Foreign Keys**: None\n")
            
            f.write("\n")
            
    print(f"Verification report written to: {output_file}")

if __name__ == "__main__":
    inspect_db()
