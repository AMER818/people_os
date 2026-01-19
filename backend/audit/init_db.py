import sqlite3
import os
from pathlib import Path


def get_project_root() -> Path:
    return Path(__file__).parent.parent.parent


def init_db():
    db_path = get_project_root() / "backend" / "data" / "people_os.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Initializing database at {db_path}...")

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # audit_runs
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS audit_runs (
        id TEXT PRIMARY KEY,
        commit_sha TEXT,
        environment TEXT,
        triggered_by TEXT,
        overall_score REAL,
        risk_level TEXT,
        critical_count INTEGER,
        major_count INTEGER,
        minor_count INTEGER,
        execution_time_seconds REAL,
        created_at TEXT
    );
    """
    )

    # audit_scores
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS audit_scores (
        id TEXT PRIMARY KEY,
        audit_run_id TEXT,
        dimension TEXT,
        score REAL,
        max_score REAL,
        severity_critical INTEGER,
        severity_major INTEGER,
        severity_minor INTEGER,
        raw_signals TEXT,
        scoring_version TEXT,
        confidence_level TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE CASCADE
    );
    """
    )

    # audit_findings
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS audit_findings (
        id TEXT PRIMARY KEY,
        audit_run_id TEXT,
        dimension TEXT,
        severity TEXT,
        title TEXT,
        description TEXT,
        recommendation TEXT,
        file_path TEXT,
        line_number INTEGER,
        commit_sha TEXT,
        status TEXT,
        acknowledged_by TEXT,
        acknowledged_at TEXT,
        acknowledgment_note TEXT,
        FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE CASCADE
    );
    """
    )

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully.")


if __name__ == "__main__":
    init_db()
