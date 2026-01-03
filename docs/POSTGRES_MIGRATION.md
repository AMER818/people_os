# Database Migration Guide: SQLite → PostgreSQL (Python/FastAPI)

**Objective:** Migrate the FastAPI backend from SQLite (development) to PostgreSQL (production).

## Prerequisites

- PostgreSQL 13+ installed
- Database credentials ready
- `psycopg2-binary` driver installed

---

## Step 1: Install PostgreSQL Driver

```bash
pip install psycopg2-binary
```

---

## Step 2: Update Environment Configuration

**Update `.env`:**
```env
# Database Configuration
DATABASE_URL=postgresql://hunzal_user:your_secure_password@localhost:5432/hunzal_hcm
```

---

## Step 3: Update Database Connection Logic

### **File:** `backend/database.py`

Modify `database.py` to handle both SQLite and PostgreSQL connection strings.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# SQLite specific check
connect_args = {}
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

---

## Step 4: Data Migration (Using Alembic)

1.  **Initialize Alembic** (if not already done):
    ```bash
    alembic init alembic
    ```

2.  **Configure `alembic.ini`**:
    Update `sqlalchemy.url` to point to your Postgres DB.

3.  **Generate Migration**:
    ```bash
    alembic revision --autogenerate -m "Initial Postgres Schema"
    ```

4.  **Apply Migration**:
    ```bash
    alembic upgrade head
    ```

---

## Step 5: Data Transfer (SQLite -> Postgres)

Since we are moving data between different DB engines, use a script to dump and load data agnostic of the engine.

**Script:** `backend/migrate_to_pg.py`
```python
import sqlite3
import psycopg2
from config import settings

def migrate_data():
    # Connect SQLite
    sqlite_conn = sqlite3.connect("hunzal_hcm.db")
    sqlite_cursor = sqlite_conn.cursor()
    
    # Connect Postgres
    pg_conn = psycopg2.connect(settings.DATABASE_URL)
    pg_cursor = pg_conn.cursor()
    
    # Example: Employees
    users = sqlite_cursor.execute("SELECT * FROM employees").fetchall()
    for user in users:
        # Construct INSERT statement...
        pass
        
    pg_conn.commit()
```

---

## Troubleshooting

- **Driver Error**: `ModuleNotFoundError: No module named 'psycopg2'`. Run `pip install psycopg2-binary`.
- **Connection Refused**: Ensure Postgres service is running on Port 5432.
