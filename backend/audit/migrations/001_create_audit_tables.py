"""
Database schema for Audit System with historical tracking.
Run this migration to create audit tables.
"""

import sqlite3
from pathlib import Path

CREATE_AUDIT_TABLES = """
-- Audit Runs: Each execution of the audit engine
CREATE TABLE IF NOT EXISTS audit_runs (
  id TEXT PRIMARY KEY,
  commit_sha TEXT,
  environment TEXT NOT NULL DEFAULT 'dev',
  triggered_by TEXT NOT NULL,
  overall_score REAL NOT NULL,
  risk_level TEXT NOT NULL,
  critical_count INTEGER DEFAULT 0,
  major_count INTEGER DEFAULT 0,
  minor_count INTEGER DEFAULT 0,
  execution_time_seconds REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Scores: Individual dimension scores per run
CREATE TABLE IF NOT EXISTS audit_scores (
  id TEXT PRIMARY KEY,
  audit_run_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  score REAL NOT NULL,
  max_score REAL DEFAULT 5.0,
  severity_critical INTEGER DEFAULT 0,
  severity_major INTEGER DEFAULT 0,
  severity_minor INTEGER DEFAULT 0,
  raw_signals TEXT NOT NULL,
  scoring_version TEXT NOT NULL DEFAULT 'v1.0.0',
  confidence_level TEXT DEFAULT 'high',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE CASCADE
);

-- Audit Findings: Detailed issues found per run
CREATE TABLE IF NOT EXISTS audit_findings (
  id TEXT PRIMARY KEY,
  audit_run_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recommendation TEXT,
  file_path TEXT,
  line_number INTEGER,
  commit_sha TEXT,
  status TEXT DEFAULT 'open',
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP,
  acknowledgment_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_runs_created_at ON audit_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_scores_run_id ON audit_scores(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_audit_scores_dimension ON audit_scores(dimension, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_findings_run_id ON audit_findings(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_status ON audit_findings(status);
"""


def run_migration(db_path):
    """Execute migration"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.executescript(CREATE_AUDIT_TABLES)
    conn.commit()
    conn.close()
    print("✅ Audit tables created successfully")


if __name__ == "__main__":
    # Get database path
    db_path = (
        Path(__file__).parent.parent.parent.parent
        / "backend"
        / "data"
        / "hunzal_hcm.db"
    )

    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        exit(1)

    print(f"Running migration on {db_path}")
    run_migration(str(db_path))
    print("✅ Migration complete!")
