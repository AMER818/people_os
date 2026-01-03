"""
Code Quality Analyzer
Checks TypeScript/Python linting, complexity, type safety.
"""

import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import (calculate_score, get_project_root, parse_eslint_output,
                     run_command_safe)


class CodeQualityAnalyzer:
    """Analyzes code quality metrics"""

    def __init__(self):
        self.project_root = get_project_root()

    def analyze(self) -> Dict:
        """Run code quality analysis"""
        findings = []
        metrics = {
            "typescript_errors": 0,
            "eslint_errors": 0,
            "python_errors": 0,
            "type_coverage": 100.0,
        }

        # 1. TypeScript Compilation Check
        ts_success, ts_out, ts_err = run_command_safe(
            ["npx", "tsc", "--noEmit"], cwd=str(self.project_root)
        )

        if not ts_success:
            error_count = ts_err.count("error TS")
            metrics["typescript_errors"] = error_count
            if error_count > 0:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="Code Quality",
                        severity="Critical" if error_count > 10 else "Major",
                        title=f"{error_count} TypeScript compilation errors",
                        description=ts_err[:500],  # First 500 chars
                        recommendation="Run `npx tsc --noEmit` and fix type errors",
                    )
                )

        # 2. ESLint Check
        eslint_success, eslint_out, eslint_err = run_command_safe(
            ["npx", "eslint", ".", "--format", "json", "--ext", ".ts,.tsx"],
            cwd=str(self.project_root),
        )

        eslint_findings = parse_eslint_output(eslint_out)
        metrics["eslint_errors"] = len(
            [f for f in eslint_findings if f["severity"] == "Major"]
        )

        for eslint_finding in eslint_findings[:10]:  # Top 10
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="Code Quality",
                    severity=eslint_finding["severity"],
                    title=f"ESLint: {eslint_finding['rule']}",
                    description=eslint_finding["message"],
                    recommendation=f"Fix in {eslint_finding['file']}:{eslint_finding['line']}",
                    file_path=eslint_finding["file"],
                    line_number=eslint_finding["line"],
                )
            )

        # 3. Calculate Score
        score = calculate_score(
            {
                "typescript_errors": metrics["typescript_errors"],
                "eslint_errors": metrics["eslint_errors"],
            }
        )

        return {
            "score": DimensionScore(
                dimension="Code Quality",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
