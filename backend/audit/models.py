"""
System Audit Models
Data structures for audit reports, findings, and scores.
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DimensionScore(BaseModel):
    """Score for a single audit dimension"""

    dimension: str
    score: float = Field(ge=0, le=5, description="Score from 0 to 5")
    findings_count: int = 0
    action_items_count: int = 0
    details: Dict = {}


class AuditFinding(BaseModel):
    """Individual audit finding"""

    id: str
    dimension: str
    severity: str  # Critical, Major, Minor
    title: str
    description: str
    recommendation: str
    line_number: Optional[int] = None
    file_path: Optional[str] = None


class PolicyResult(BaseModel):
    """Result of a policy evaluation"""

    name: str
    pass_status: bool
    message: str
    enforced: bool
    rule: str


class ActionItem(BaseModel):
    """Remediation action item"""

    issue: str
    area: str
    priority: str  # Critical, High, Medium, Low
    effort: str  # Hours, Days, Weeks
    eta: Optional[str] = None
    owner: Optional[str] = None


class AuditReport(BaseModel):
    """Complete system audit report"""

    id: str
    created_at: datetime
    version: str
    scope: str
    overall_score: float = Field(ge=0, le=5)
    critical_count: int = 0
    major_count: int = 0
    minor_count: int = 0
    risk_level: str  # Low, Medium, High, Critical

    dimension_scores: List[DimensionScore]
    critical_findings: List[AuditFinding] = []
    major_findings: List[AuditFinding] = []
    minor_findings: List[AuditFinding] = []
    technical_debt: List[ActionItem] = []
    action_plan: List[ActionItem] = []
    policy_results: List[PolicyResult] = []

    executed_by: str
    execution_time_seconds: float = 0

    class Config:
        json_schema_extra = {
            "example": {
                "id": "audit-20260103-001",
                "created_at": "2026-01-03T13:20:00",
                "version": "1.0.0",
                "scope": "Full System",
                "overall_score": 3.9,
                "critical_count": 2,
                "major_count": 6,
                "minor_count": 12,
                "risk_level": "Medium",
            }
        }
