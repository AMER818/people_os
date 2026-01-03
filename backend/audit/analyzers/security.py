"""
Security Analyzer
Checks RBAC coverage, secrets exposure, rate limiting.
"""

import re
import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import calculate_score, get_project_root


class SecurityAnalyzer:
    """Analyzes security posture"""

    def __init__(self):
        self.project_root = get_project_root()

    def analyze(self) -> Dict:
        """Run security analysis"""
        findings = []
        metrics = {
            "rbac_coverage": 0,
            "exposed_secrets": 0,
            "unprotected_endpoints": 0,
            "rate_limited_endpoints": 0,
        }

        # 1. Check for hardcoded secrets
        secret_patterns = [
            r'password\s*=\s*["\'](?!{{|admin|test)[^"\']+["\']',
            r'api[_-]?key\s*=\s*["\'][^"\']+["\']',
            r'secret\s*=\s*["\'][^"\']{8,}["\']',
        ]

        for py_file in self.project_root.rglob("*.py"):
            if "venv" in str(py_file) or "node_modules" in str(py_file):
                continue

            try:
                content = py_file.read_text(encoding="utf-8")
                for pattern in secret_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    if matches:
                        metrics["exposed_secrets"] += len(matches)
                        findings.append(
                            AuditFinding(
                                id=str(uuid.uuid4()),
                                dimension="Security",
                                severity="Critical",
                                title="Potential hardcoded secret detected",
                                description=f"Found in {py_file.name}",
                                recommendation="Move secrets to environment variables",
                                file_path=str(py_file),
                            )
                        )
            except Exception:
                pass

        # 2. Check RBAC coverage on endpoints
        main_py = self.project_root / "backend" / "main.py"
        if main_py.exists():
            content = main_py.read_text(encoding="utf-8")

            # Count endpoints
            endpoints = re.findall(r'@app\.(get|post|put|delete)\("([^"]+)"\)', content)
            total_endpoints = len(endpoints)

            # Count protected endpoints
            protected = content.count("requires_role") + content.count(
                "get_current_user"
            )
            metrics["rbac_coverage"] = int((protected / max(total_endpoints, 1)) * 100)

            # Count rate-limited endpoints
            rate_limited = content.count("@limiter.limit")
            metrics["rate_limited_endpoints"] = rate_limited

            if metrics["rbac_coverage"] < 80:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="Security",
                        severity="Major",
                        title=f"RBAC coverage at {metrics['rbac_coverage']}%",
                        description="Some endpoints may lack authentication/authorization",
                        recommendation="Add `Depends(get_current_user)` or `requires_role` to sensitive endpoints",
                    )
                )

        # 3. Calculate Score
        score_metrics = {
            "rbac_coverage": metrics["rbac_coverage"] / 20,  # 100% = 5.0
            "exposed_secrets": 5 - min(5, metrics["exposed_secrets"]),
        }
        score = calculate_score(score_metrics)

        return {
            "score": DimensionScore(
                dimension="Security",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
