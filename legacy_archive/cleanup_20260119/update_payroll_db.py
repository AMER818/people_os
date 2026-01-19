
from backend.database import engine, Base
from backend.models import DBPayrollSettings
from sqlalchemy import text

def reset_payroll_table():
    print("Dropping payroll_settings table...")
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS payroll_settings"))
            conn.commit()
        print("Table dropped.")
        
        print("Recreating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables recreated (including payroll_settings if missing).")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_payroll_table()
