"""
Persistence layer for audit data.
Handles saving and retrieving audit runs, scores, and findings.
"""

import json
import sqlite3
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from .models import AuditFinding, AuditReport, DimensionScore
from backend.config import settings


class AuditPersistence:
    """Manages audit data persistence to database"""

    def __init__(self, db_path: Optional[Path] = None):
        if db_path is None:
            # Use unified project database setting
            self.db_path = settings.DB_PATH
        else:
            self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def save_audit_run(
        self,
        report: AuditReport,
        commit_sha: Optional[str] = None,
        environment: str = "dev",
    ) -> str:
        """
        Save complete audit run to database.

        Returns:
            audit_run_id
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            # Save audit run
            cursor.execute(
                """
                INSERT INTO audit_runs (
                    id, commit_sha, environment, triggered_by,
                    overall_score, risk_level, critical_count, major_count, minor_count,
                    execution_time_seconds, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    report.id,
                    commit_sha,
                    environment,
                    report.executed_by,
                    report.overall_score,
                    report.risk_level,
                    report.critical_count,
                    report.major_count,
                    report.minor_count,
                    report.execution_time_seconds,
                    report.created_at.isoformat(),
                ),
            )

            # Save dimension scores
            for dim_score in report.dimension_scores:
                score_id = str(uuid.uuid4())
                cursor.execute(
                    """
                    INSERT INTO audit_scores (
                        id, audit_run_id, dimension, score, max_score,
                        severity_critical, severity_major, severity_minor,
                        raw_signals, scoring_version, confidence_level
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        score_id,
                        report.id,
                        dim_score.dimension,
                        dim_score.score,
                        5.0,
                        0,  # Will be calculated from findings
                        0,
                        0,
                        json.dumps(dim_score.details),
                        "v1.0.0",
                        "high",  # Default confidence
                    ),
                )

            # Save findings
            all_findings = (
                report.critical_findings + report.major_findings + report.minor_findings
            )
            for finding in all_findings:
                cursor.execute(
                    """
                    INSERT INTO audit_findings (
                        id, audit_run_id, dimension, severity, title,
                        description, recommendation, file_path, line_number,
                        commit_sha, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        finding.id,
                        report.id,
                        finding.dimension,
                        finding.severity,
                        finding.title,
                        finding.description,
                        finding.recommendation,
                        finding.file_path,
                        finding.line_number,
                        commit_sha,
                        "open",
                    ),
                )

            conn.commit()
            print(f"[OK] Saved audit run {report.id} to database")
            return report.id

        except Exception as e:
            conn.rollback()
            print(f"❌ Failed to save audit run: {str(e)}")
            raise
        finally:
            conn.close()

    def get_audit_history(self, limit: int = 20) -> List[Dict]:
        """Get recent audit runs"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, commit_sha, environment, triggered_by,
                   overall_score, risk_level, critical_count, major_count, minor_count,
                   execution_time_seconds, created_at
            FROM audit_runs
            ORDER BY created_at DESC
            LIMIT ?
        """,
            (limit,),
        )

        runs = []
        for row in cursor.fetchall():
            runs.append(
                {
                    "id": row["id"],
                    "commit_sha": row["commit_sha"],
                    "environment": row["environment"],
                    "triggered_by": row["triggered_by"],
                    "overall_score": row["overall_score"],
                    "risk_level": row["risk_level"],
                    "critical_count": row["critical_count"],
                    "major_count": row["major_count"],
                    "minor_count": row["minor_count"],
                    "execution_time_seconds": row["execution_time_seconds"],
                    "created_at": row["created_at"],
                }
            )

        conn.close()
        return runs

    def get_dimension_trend(self, dimension: str, days: int = 30) -> List[Dict]:
        """
        Get score trend for a dimension over time.

        Returns:
            List of {"date": "2026-01-03", "score": 3.8}
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        since_date = (datetime.now() - timedelta(days=days)).isoformat()

        cursor.execute(
            """
            SELECT 
                DATE(s.created_at) as date,
                AVG(s.score) as score
            FROM audit_scores s
            JOIN audit_runs r ON s.audit_run_id = r.id
            WHERE s.dimension = ? AND r.created_at >= ?
            GROUP BY DATE(s.created_at)
            ORDER BY date ASC
        """,
            (dimension, since_date),
        )

        trend = []
        for row in cursor.fetchall():
            trend.append({"date": row["date"], "score": round(row["score"], 2)})

        conn.close()
        return trend

    def get_regression_alerts(self, threshold: float = 0.5) -> List[Dict]:
        """
        Detect score regressions (drops > threshold).

        Returns:
            List of regression alerts
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # Get last two runs per dimension
        cursor.execute(
            """
            WITH ranked_scores AS (
                SELECT 
                    s.dimension,
                    s.score,
                    s.created_at,
                    ROW_NUMBER() OVER (PARTITION BY s.dimension ORDER BY s.created_at DESC) as rn
                FROM audit_scores s
            )
            SELECT 
                curr.dimension,
                prev.score as previous_score,
                curr.score as current_score,
                (prev.score - curr.score) as drop
            FROM ranked_scores curr
            JOIN ranked_scores prev ON curr.dimension = prev.dimension AND prev.rn = 2
            WHERE curr.rn = 1 AND (prev.score - curr.score) > ?
        """,
            (threshold,),
        )

        alerts = []
        for row in cursor.fetchall():
            alerts.append(
                {
                    "dimension": row["dimension"],
                    "previous_score": row["previous_score"],
                    "current_score": row["current_score"],
                    "drop": round(row["drop"], 2),
                }
            )

        conn.close()
        return alerts

    def acknowledge_finding(self, finding_id: str, user_id: str, note: str) -> bool:
        """Mark finding as acknowledged"""
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE audit_findings
            SET status = 'acknowledged',
                acknowledged_by = ?,
                acknowledged_at = ?,
                acknowledgment_note = ?
            WHERE id = ?
        """,
            (user_id, datetime.now().isoformat(), note, finding_id),
        )

        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        return success


# Singleton instance
_persistence = None


def get_persistence() -> AuditPersistence:
    """Get global persistence instance"""
    global _persistence
    if _persistence is None:
        _persistence = AuditPersistence()
    return _persistence
