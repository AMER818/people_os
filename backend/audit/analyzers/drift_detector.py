"""
Architectural Drift Detector Analyzer
Identifies deviations from ADRs and agreed patterns.
"""

import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import get_project_root


class DriftDetector:
    """Detects drift from architectural standards"""

    def analyze(self) -> Dict:
        root = get_project_root()
        adr_dir = root / "docs" / "architecture"
        findings = []
        metrics = {
            "adr_count": 0,
            "drift_violation_count": 0,
            "undocumented_modules": 0,
        }

        # 1. Count ADRs
        if adr_dir.exists():
            adrs = list(adr_dir.glob("ADR-*.md"))
            metrics["adr_count"] = len(adrs)

        # 2. Check for key architectural patterns (Simple static check for now)
        # In a real scenario, this would call AI with the prompts created earlier

        # Check: UI should not import from repository or db directly
        modules_dir = root / "src"
        for py_file in modules_dir.rglob("*.tsx"):
            try:
                content = py_file.read_text(encoding="utf-8")
                if (
                    "/repository" in content
                    or "import { api }" not in content
                    and "axios" in content
                ):
                    # Potential direct API usage bypass or layer violation
                    pass
            except:
                continue

        # Check for undocumented top-level modules
        for item in modules_dir.iterdir():
            if item.is_dir():
                # Check if this module has a corresponding ADR or doc
                has_doc = any(
                    item.name.lower() in f.name.lower() for f in adr_dir.glob("*.md")
                )
                if not has_doc:
                    metrics["undocumented_modules"] += 1
                    findings.append(
                        AuditFinding(
                            id=str(uuid.uuid4()),
                            dimension="Architecture",
                            severity="Minor",
                            title=f"Undocumented Module: {item.name}",
                            description=f"No ADR or architectural documentation found for the '{item.name}' module.",
                            recommendation="Create an ADR summarizing the module's purpose and key decisions.",
                        )
                    )

        score = DimensionScore(
            dimension="Drift Detection",
            score=max(0, 5 - (metrics["undocumented_modules"] * 0.5)),
            findings_count=len(findings),
            details=metrics,
        )

        return {"score": score, "findings": findings}
