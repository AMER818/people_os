"""
DevOps, Operations & Resilience Analyzer
Checks deployment scripts, backup strategies, environment parity.
"""

import re
import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import calculate_score, get_project_root


class DevOpsAnalyzer:
    """Analyzes DevOps and operational readiness"""

    def __init__(self):
        self.project_root = get_project_root()

    def analyze(self) -> Dict:
        """Run DevOps analysis"""
        findings = []
        metrics = {
            "deployment_scripts": 0,
            "backup_strategy": 0,
            "environment_config": 0,
            "docker_support": 0,
            "ci_cd_config": 0,
        }

        # Check for deployment scripts
        deployment_files = [
            "start_app.bat",
            "start_app.sh",
            "deploy.sh",
            "deploy.yml",
            "Dockerfile",
        ]

        for dep_file in deployment_files:
            if (self.project_root / dep_file).exists():
                metrics["deployment_scripts"] += 1

        if metrics["deployment_scripts"] == 0:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="DevOps",
                    severity="Major",
                    title="No deployment scripts found",
                    description="Missing automated deployment configuration",
                    recommendation="Create deployment scripts (start_app.bat/sh, Dockerfile)",
                )
            )

        # Check for backup strategy
        backup_files = ["backup_db.bat", "backup_db.sh", "backup.py"]

        for backup_file in backup_files:
            if (self.project_root / backup_file).exists():
                metrics["backup_strategy"] += 1

        if metrics["backup_strategy"] == 0:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="DevOps",
                    severity="Critical",
                    title="No backup strategy implemented",
                    description="Database backup scripts not found",
                    recommendation="Implement automated database backup mechanism",
                )
            )

        # Check for environment configuration
        env_files = [".env.example", ".env.template", "config.py"]

        for env_file in env_files:
            if (self.project_root / env_file).exists() or (
                self.project_root / "backend" / env_file
            ).exists():
                metrics["environment_config"] += 1

        # Check for Docker support
        if (self.project_root / "Dockerfile").exists():
            metrics["docker_support"] = 1

        if (self.project_root / "docker-compose.yml").exists():
            metrics["docker_support"] += 1

        # Check for CI/CD configuration
        ci_files = [
            ".github/workflows",
            ".gitlab-ci.yml",
            "Jenkinsfile",
            "azure-pipelines.yml",
        ]

        for ci_file in ci_files:
            if (self.project_root / ci_file).exists():
                metrics["ci_cd_config"] += 1

        if metrics["ci_cd_config"] == 0:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="DevOps",
                    severity="Minor",
                    title="No CI/CD configuration found",
                    description="Missing automated testing/deployment pipeline",
                    recommendation="Consider setting up GitHub Actions or similar CI/CD",
                )
            )

        # Check for Security Policy
        if not (self.project_root / "SECURITY.md").exists():
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="DevOps",
                    severity="Minor",
                    title="Missing Security Policy",
                    description="SECURITY.md file found in root.",
                    recommendation="Add a SECURITY.md to define reporting procedures.",
                )
            )

        # Check Dockerfile Best Practices (Pinning)
        dockerfile_path = self.project_root / "Dockerfile"
        if dockerfile_path.exists():
            try:
                content = dockerfile_path.read_text(encoding="utf-8")
                # Check for :latest usage
                if re.search(
                    r"FROM\s+[\w\-/]+:latest", content, re.IGNORECASE
                ) or re.search(r"FROM\s+[\w\-/]+\s*$", content, re.MULTILINE):
                    findings.append(
                        AuditFinding(
                            id=str(uuid.uuid4()),
                            dimension="DevOps",
                            severity="Major",
                            title="Unpinned Docker Base Image",
                            description="Dockerfile uses :latest or no tag",
                            recommendation="Pin base images to specific versions (e.g. python:3.9-slim)",
                        )
                    )
            except Exception:
                pass

        # Calculate score
        score = calculate_score(
            {
                "deployment": min(5, metrics["deployment_scripts"] * 2),
                "backup": metrics["backup_strategy"] * 5,
                "environment": min(5, metrics["environment_config"] * 2),
                "docker": metrics["docker_support"] * 2.5,
                "ci_cd": metrics["ci_cd_config"] * 2,
            }
        )

        return {
            "score": DimensionScore(
                dimension="DevOps",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
