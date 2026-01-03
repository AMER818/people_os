"""
UI/UX & Design System Compliance Analyzer
Checks design token usage, component reuse, accessibility.
"""

import re
import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import calculate_score, get_project_root


class UIUXAnalyzer:
    """Analyzes UI/UX quality and design system compliance"""

    def __init__(self):
        self.project_root = get_project_root()

    def analyze(self) -> Dict:
        """Run UI/UX analysis"""
        findings = []
        metrics = {
            "hardcoded_colors": 0,
            "hardcoded_spacing": 0,
            "component_reuse": 0,
            "accessibility_violations": 0,
            "css_files": 0,
            "responsive_layouts": 0,
        }

        # Check for hardcoded styles in TSX files
        modules_dir = self.project_root / "modules"
        components_dir = self.project_root / "components"

        tsx_files = []
        if modules_dir.exists():
            tsx_files.extend(
                [
                    p
                    for p in modules_dir.rglob("*.tsx")
                    if not p.name.endswith(".test.tsx")
                    and not p.name.endswith(".spec.tsx")
                ]
            )
        if components_dir.exists():
            tsx_files.extend(
                [
                    p
                    for p in components_dir.rglob("*.tsx")
                    if not p.name.endswith(".test.tsx")
                    and not p.name.endswith(".spec.tsx")
                ]
            )

        for tsx_file in tsx_files:
            try:
                content = tsx_file.read_text(encoding="utf-8")

                # Check for hardcoded colors (hex, rgb)
                hex_colors = len(re.findall(r'["\']#[0-9A-Fa-f]{3,6}["\']', content))
                rgb_colors = len(re.findall(r"rgb\(", content))
                metrics["hardcoded_colors"] += hex_colors + rgb_colors

                # Check for hardcoded spacing/sizing
                px_values = len(re.findall(r"\d+px", content))
                metrics["hardcoded_spacing"] += px_values

                # Check for basic accessibility
                if "aria-label" not in content and "alt=" not in content:
                    metrics["accessibility_violations"] += 1
                    if "accessibility_files" not in metrics:
                        metrics["accessibility_files"] = []
                    metrics["accessibility_files"].append(str(tsx_file))

                # Check for responsive design utilities
                responsive_utils = len(
                    re.findall(r"(sm:|md:|lg:|xl:|2xl:|@media)", content)
                )
                if responsive_utils > 0:
                    metrics["responsive_layouts"] += 1

            except Exception:
                pass

        # Count CSS files
        if modules_dir.exists():
            metrics["css_files"] = len(list(modules_dir.rglob("*.css")))

        # Component reuse estimation
        if components_dir.exists():
            metrics["component_reuse"] = len(list(components_dir.rglob("*.tsx")))

        # Generate findings
        if metrics["hardcoded_colors"] > 50:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="UI/UX",
                    severity="Minor",
                    title=f"{metrics['hardcoded_colors']} hardcoded color values detected",
                    description="Colors should use design tokens/CSS variables",
                    recommendation="Migrate hardcoded colors to design system tokens",
                )
            )

        if metrics["hardcoded_spacing"] > 100:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="UI/UX",
                    severity="Minor",
                    title=f"{metrics['hardcoded_spacing']} hardcoded spacing values",
                    description="Spacing should use design tokens (e.g., Tailwind classes)",
                    recommendation="Use consistent spacing scale from design system",
                )
            )

        if metrics["accessibility_violations"] > 10:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="UI/UX",
                    severity="Major",
                    title=f"{metrics['accessibility_violations']} components lack accessibility attributes",
                    description="Missing aria-labels, alt text, or other a11y features",
                    recommendation="Add ARIA labels and alt text to improve accessibility",
                )
            )

        if metrics["responsive_layouts"] < len(tsx_files) * 0.3:
            # Heuristic: at least 30% of components should potentially have responsive modifiers
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="UI/UX",
                    severity="Minor",
                    title="Low responsive design usage",
                    description="Less than 30% of components show responsive utility usage",
                    recommendation="Ensure layouts adapt to mobile/tablet screens",
                )
            )

        # Calculate score
        score = calculate_score(
            {
                "hardcoded_colors": max(0, 5 - (metrics["hardcoded_colors"] / 50)),
                "hardcoded_spacing": max(0, 5 - (metrics["hardcoded_spacing"] / 100)),
                "accessibility": max(0, 5 - (metrics["accessibility_violations"] / 10)),
                "responsiveness": min(
                    5, (metrics["responsive_layouts"] / max(1, len(tsx_files))) * 10
                ),
            }
        )

        return {
            "score": DimensionScore(
                dimension="UI/UX",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
