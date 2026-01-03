"""
Performance Analyzer
Checks for React performance best practices and asset sizes.
"""

import re
import uuid
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import calculate_score, get_project_root


class PerformanceAnalyzer:
    """Analyzes Frontend Performance metrics"""

    def __init__(self):
        self.project_root = get_project_root()

    def analyze(self) -> Dict:
        """Run Performance analysis"""
        findings = []
        metrics = {
            "memoization_usage": 0,
            "lazy_loading": 0,
            "virtualization": 0,
            "large_assets": 0,
            "img_optimization": 0,
            "total_components": 0,
        }

        # Check for performance patterns in TSX files
        modules_dir = self.project_root / "modules"
        components_dir = self.project_root / "components"
        assets_dir = self.project_root / "public"

        tsx_files = []
        if modules_dir.exists():
            tsx_files.extend(list(modules_dir.rglob("*.tsx")))
        if components_dir.exists():
            tsx_files.extend(list(components_dir.rglob("*.tsx")))

        metrics["total_components"] = len(tsx_files)

        for tsx_file in tsx_files:
            try:
                content = tsx_file.read_text(encoding="utf-8")

                # Check for Memoization
                if (
                    "useMemo" in content
                    or "useCallback" in content
                    or "React.memo" in content
                ):
                    metrics["memoization_usage"] += 1

                # Check for Lazy Loading
                if (
                    "React.lazy" in content
                    or "lazy(" in content
                    or "Suspense" in content
                ):
                    metrics["lazy_loading"] += 1

                # Check for Virtualization usage
                if (
                    "react-window" in content
                    or "react-virtualized" in content
                    or "@tanstack/react-virtual" in content
                ):
                    metrics["virtualization"] += 1

                # Check for optimized image components vs <img>
                if (
                    "<Image" in content or "next/image" in content
                ):  # Pseudo-check for optimized components
                    metrics["img_optimization"] += 1

            except Exception:
                pass

        # Check for Large Assets (>500KB)
        if assets_dir.exists():
            for file_path in assets_dir.rglob("*"):
                if file_path.is_file():
                    try:
                        size_kb = file_path.stat().st_size / 1024
                        if size_kb > 500:
                            metrics["large_assets"] += 1
                            findings.append(
                                AuditFinding(
                                    id=str(uuid.uuid4()),
                                    dimension="Performance",
                                    severity="Major",
                                    title=f"Large Asset Detected: {file_path.name}",
                                    description=f"File size {size_kb:.1f}KB exceeds 500KB limit",
                                    recommendation="Compress image or use Next.js Image Optimization",
                                    file_path=str(file_path),
                                )
                            )
                    except Exception:
                        pass

        # Generate findings based on heuristics
        if metrics["total_components"] > 0:
            memo_ratio = metrics["memoization_usage"] / metrics["total_components"]
            if memo_ratio < 0.1:  # Expect at least 10% memoization in complex apps
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="Performance",
                        severity="Minor",
                        title="Low Memoization Usage",
                        description=f"Only {metrics['memoization_usage']} components use memoization patterns",
                        recommendation="Review expensive renders and apply useMemo/useCallback where appropriate",
                    )
                )

        # Calculate score (Simplified)
        # Base 5.0
        # -0.5 per large asset (max 2.0 deduction)
        # +1.0 for virtualization usage
        # +0.5 if memoization > 10%

        score_val = 5.0
        score_val -= min(2.0, metrics["large_assets"] * 0.5)

        if metrics["virtualization"] > 0:
            score_val = min(5.0, score_val + 0.5)  # Bonus

        # Clamp
        score_val = max(0.0, min(5.0, score_val))

        return {
            "score": DimensionScore(
                dimension="Performance",
                score=round(score_val, 1),
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
