from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import declarative_base
from backend.config import settings
import datetime

Base = declarative_base()

class DBAuditRun(Base):
    __tablename__ = "audit_runs"
    id = Column(String, primary_key=True)
    commit_sha = Column(String, nullable=True)
    environment = Column(String)
    triggered_by = Column(String)
    overall_score = Column(Float)
    risk_level = Column(String)
    critical_count = Column(Integer)
    major_count = Column(Integer)
    minor_count = Column(Integer)
    execution_time_seconds = Column(Float)
    created_at = Column(String)  # ISO string in persistence

class DBAuditScore(Base):
    __tablename__ = "audit_scores"
    id = Column(String, primary_key=True)
    audit_run_id = Column(String, ForeignKey("audit_runs.id"), nullable=False)
    dimension = Column(String)
    score = Column(Float)
    max_score = Column(Float)
    severity_critical = Column(Integer)
    severity_major = Column(Integer)
    severity_minor = Column(Integer)
    raw_signals = Column(JSON) # Stored as JSON string
    scoring_version = Column(String)
    confidence_level = Column(String)

class DBAuditFinding(Base):
    __tablename__ = "audit_findings"
    id = Column(String, primary_key=True)
    audit_run_id = Column(String, ForeignKey("audit_runs.id"), nullable=False)
    dimension = Column(String)
    severity = Column(String)
    title = Column(String)
    description = Column(Text)
    recommendation = Column(Text)
    file_path = Column(String)
    line_number = Column(Integer)
    commit_sha = Column(String, nullable=True)
    status = Column(String)
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(String, nullable=True)
    acknowledgment_note = Column(Text, nullable=True)

engine = create_engine(settings.DATABASE_URL)
Base.metadata.drop_all(engine) # Reset tables
Base.metadata.create_all(engine)
print("Audit tables dropped and recreated successfully.")
