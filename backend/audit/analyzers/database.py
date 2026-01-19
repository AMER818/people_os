"""
Database & Data Integrity Analyzer
Checks schema normalization, foreign keys, index coverage, migrations.
"""

import sqlite3
import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import calculate_score, get_project_root


class DatabaseAnalyzer:
    """Analyzes database integrity and quality"""

    def __init__(self):
        self.project_root = get_project_root()
        self.db_path = self.project_root / "backend" / "data" / "people_os.db"

    def analyze(self) -> Dict:
        """Run database analysis"""
        findings = []
        metrics = {
            "foreign_keys_enforced": 0,
            "indexes_count": 0,
            "tables_without_indexes": 0,
            "migration_files": 0,
            "orphaned_records_risk": 0,
        }

        if not self.db_path.exists():
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="Database",
                    severity="Critical",
                    title="Database file not found",
                    description=f"Expected database at {self.db_path}",
                    recommendation="Ensure database is initialized",
                )
            )
            return {
                "score": DimensionScore(
                    dimension="Database", score=0.0, findings_count=1, details=metrics
                ),
                "findings": findings,
            }

        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            # Check foreign key enforcement
            cursor.execute("PRAGMA foreign_keys")
            fk_status = cursor.fetchone()
            metrics["foreign_keys_enforced"] = (
                1 if fk_status and fk_status[0] == 1 else 0
            )

            if not metrics["foreign_keys_enforced"]:
                # Double check if enabled via code (static analysis)
                db_py = self.project_root / "backend" / "database.py"
                code_enforced = False
                if db_py.exists():
                    content = db_py.read_text(encoding="utf-8")
                    if "PRAGMA foreign_keys=ON" in content:
                        code_enforced = True
                        metrics["foreign_keys_enforced"] = (
                            1  # Credit for code enforcement
                        )

                if not code_enforced:
                    findings.append(
                        AuditFinding(
                            id=str(uuid.uuid4()),
                            dimension="Database",
                            severity="Major",
                            title="Foreign keys not enforced",
                            description="PRAGMA foreign_keys is not enabled in DB or Code",
                            recommendation="Enable foreign key constraints in connection settings",
                        )
                    )

            # Count indexes
            cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index'")
            metrics["indexes_count"] = cursor.fetchone()[0]

            # Check for tables without indexes & Schema Normalization & FK Definitions
            cursor.execute(
                """
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            """
            )
            tables = [row[0] for row in cursor.fetchall()]

            for table in tables:
                # 1. Index Check
                cursor.execute(
                    f"SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name='{table}'"
                )
                index_count = cursor.fetchone()[0]
                if index_count == 0:
                    metrics["tables_without_indexes"] += 1
                    findings.append(
                        AuditFinding(
                            id=str(uuid.uuid4()),
                            dimension="Database",
                            severity="Minor",
                            title=f"Table '{table}' has no indexes",
                            description="May impact query performance",
                            recommendation=f"Consider adding indexes to {table}",
                        )
                    )

                # 2. Schema Normalization (Column Count)
                cursor.execute(f"PRAGMA table_info('{table}')")
                columns_info = cursor.fetchall()
                col_count = len(columns_info)
                col_names = [c[1] for c in columns_info]

                if col_count > 20:
                    findings.append(
                        AuditFinding(
                            id=str(uuid.uuid4()),
                            dimension="Database",
                            severity="Minor",
                            title=f"Potential Denormalization: '{table}'",
                            description=f"Table has {col_count} columns (threshold: 20)",
                            recommendation="Consider standardizing schema or splitting tables.",
                        )
                    )

                # 3. Foreign Key Definition Check
                cursor.execute(f"PRAGMA foreign_key_list('{table}')")
                fks = (
                    cursor.fetchall()
                )  # (id, seq, table, from, to, on_update, on_delete, match)
                fk_columns = [f[3] for f in fks]

                for col in col_names:
                    if col.endswith("_id") and col not in fk_columns:
                        # Heuristic: 'parent_id', 'user_id' etc should likely be FKs
                        findings.append(
                            AuditFinding(
                                id=str(uuid.uuid4()),
                                dimension="Database",
                                severity="Major",
                                title=f"Unenforced Foreign Key: '{table}.{col}'",
                                description=f"Column '{col}' suggests a relation but has no FK constraint.",
                                recommendation=f"Add FOREIGN KEY constraint for {col}",
                            )
                        )

            conn.close()

        except Exception as e:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="Database",
                    severity="Major",
                    title="Database connection failed",
                    description=str(e),
                    recommendation="Check database file permissions and integrity",
                )
            )

        # Count migration files
        migrations_dir = self.project_root / "backend" / "migrations"
        if migrations_dir.exists():
            metrics["migration_files"] = len(
                list(migrations_dir.glob("*.sql")) + list(migrations_dir.glob("*.py"))
            )

        # Calculate score
        score = calculate_score(
            {
                "foreign_keys": metrics["foreign_keys_enforced"] * 5,
                "indexes": min(5, metrics["indexes_count"] / 10),
                "tables_without_indexes": 5 - metrics["tables_without_indexes"],
            }
        )

        return {
            "score": DimensionScore(
                dimension="Database",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
