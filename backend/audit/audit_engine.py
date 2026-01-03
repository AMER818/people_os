"""
System Audit Engine
Orchestrates comprehensive system audit across multiple dimensions.
"""

import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from .analyzers.ai_layer import AILayerAnalyzer
from .analyzers.api_stability import APIAnalyzer
from .analyzers.architecture import ArchitectureAnalyzer
from .analyzers.code_quality import CodeQualityAnalyzer
from .analyzers.database import DatabaseAnalyzer
from .analyzers.devops import DevOpsAnalyzer
from .analyzers.drift_detector import DriftDetector
from .analyzers.performance import PerformanceAnalyzer
from .analyzers.security import SecurityAnalyzer
from .analyzers.testing import TestingAnalyzer
from .analyzers.ui_ux import UIUXAnalyzer
from .models import ActionItem, AuditFinding, AuditReport, DimensionScore
from .persistence import get_persistence
from .report_generator import ReportGenerator
from .rule_engine import get_policy_evaluator, get_rule_engine


class AuditEngine:
    """Core audit orchestration engine - 9 dimensions"""

    def __init__(self):
        # Determine project root dynamically
        self.project_root = str(Path(__file__).parent.parent.parent)

        self.analyzers = {
            "code_quality": CodeQualityAnalyzer(),
            "security": SecurityAnalyzer(),
            "testing": TestingAnalyzer(),
            "database": DatabaseAnalyzer(),
            "api": APIAnalyzer(),
            "architecture": ArchitectureAnalyzer(self.project_root),
            "ui_ux": UIUXAnalyzer(),
            "ai_layer": AILayerAnalyzer(),
            "devops": DevOpsAnalyzer(),
            "drift_detection": DriftDetector(),
            "performance": PerformanceAnalyzer(),
        }
        self.rule_engine = get_rule_engine()
        self.policy_evaluator = get_policy_evaluator()

    def run_audit(self, executed_by: str, scope: str = "Full System") -> AuditReport:
        """
        Execute comprehensive system audit.

        Args:
            executed_by: User ID who triggered the audit
            scope: Audit scope description

        Returns:
            Complete audit report
        """
        start_time = time.time()

        # Initialize report
        report_id = f"audit-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        dimension_scores: List[DimensionScore] = []
        all_findings: List[AuditFinding] = []

        # Run all analyzers
        for analyzer_name, analyzer in self.analyzers.items():
            try:
                result = analyzer.analyze()
                findings = result["findings"]
                signals = result["score"].details

                # Apply Audit-as-Code rules if available for this dimension
                rule_dim = analyzer_name
                # Map analyzer keys to rule dimensions if different
                if analyzer_name == "api":
                    rule_dim = "api_stability"
                elif analyzer_name == "ui_ux":
                    rule_dim = "ui_ux"

                try:
                    rule_result = self.rule_engine.apply_rule(rule_dim, signals)
                    # Update score from rule engine (deterministic)
                    dim_score = DimensionScore(
                        dimension=result["score"].dimension,
                        score=rule_result.score,
                        findings_count=len(findings),
                        details=signals,
                    )
                    # Optionally add violations from rules to findings if they aren't there
                    for violation in rule_result.violations:
                        # Check if a similar finding already exists
                        if not any(
                            f.title.lower().startswith(violation["signal"].lower())
                            for f in findings
                        ):
                            findings.append(
                                AuditFinding(
                                    id=str(uuid.uuid4()),
                                    dimension=dim_score.dimension,
                                    severity=violation["severity"],
                                    title=f"Rule Violation: {violation['signal']}",
                                    description=f"Value {violation['value']} exceeded max {violation['max']}",
                                    recommendation=f"Improve {violation['signal']} to meet policy",
                                )
                            )

                    dimension_scores.append(dim_score)
                except (ValueError, KeyError):
                    # Fallback to analyzer score if no rule found
                    dimension_scores.append(result["score"])

                all_findings.extend(findings)
            except Exception as e:
                # Log error but continue
                print(f"Analyzer {analyzer_name} failed: {str(e)}")
                # Add error finding
                all_findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension=analyzer_name.replace("_", " ").title(),
                        severity="Major",
                        title=f"Analyzer execution failed: {analyzer_name}",
                        description=str(e),
                        recommendation="Check analyzer implementation and dependencies",
                    )
                )

        # Classify findings by severity
        critical_findings = [f for f in all_findings if f.severity == "Critical"]
        major_findings = [f for f in all_findings if f.severity == "Major"]
        minor_findings = [f for f in all_findings if f.severity == "Minor"]

        # Calculate overall score (average of dimension scores)
        overall_score = sum(ds.score for ds in dimension_scores) / max(
            len(dimension_scores), 1
        )
        overall_score = round(overall_score, 1)

        # Determine risk level
        risk_level = self._calculate_risk_level(
            overall_score, len(critical_findings), len(major_findings)
        )

        # Generate action items from critical/major findings
        action_plan = self._generate_action_plan(critical_findings + major_findings)

        # Build report
        report = AuditReport(
            id=report_id,
            created_at=datetime.now(),
            version="1.0.0",
            scope=scope,
            overall_score=overall_score,
            critical_count=len(critical_findings),
            major_count=len(major_findings),
            minor_count=len(minor_findings),
            risk_level=risk_level,
            dimension_scores=dimension_scores,
            critical_findings=critical_findings,
            major_findings=major_findings,
            minor_findings=minor_findings,
            action_plan=action_plan,
            executed_by=executed_by,
            execution_time_seconds=time.time() - start_time,
        )

        # Run policy evaluation
        report.policy_results = self.policy_evaluator.evaluate_policies(report)

        return report

    def _calculate_risk_level(
        self, overall_score: float, critical_count: int, major_count: int
    ) -> str:
        """Determine system risk level"""
        if critical_count > 5 or overall_score < 2.0:
            return "Critical"
        elif critical_count > 0 or major_count > 10 or overall_score < 3.0:
            return "High"
        elif major_count > 5 or overall_score < 4.0:
            return "Medium"
        else:
            return "Low"

    def _generate_action_plan(self, findings: List[AuditFinding]) -> List[ActionItem]:
        """Convert findings into actionable items"""
        action_items = []

        for finding in findings[:10]:  # Top 10 priorities
            priority = "Critical" if finding.severity == "Critical" else "High"
            effort = "Days" if finding.severity == "Critical" else "Hours"

            action_items.append(
                ActionItem(
                    issue=finding.title,
                    area=finding.dimension,
                    priority=priority,
                    effort=effort,
                    eta=None,  # To be filled by team
                    owner=None,  # To be assigned
                )
            )

        return action_items


# Convenience function for quick audit execution
def run_system_audit(executed_by: str, save_to_db: bool = True) -> AuditReport:
    """
    Run a complete system audit.

    Args:
        executed_by: User ID who triggered audit
        save_to_db: Whether to persist to database (default: True)

    Returns:
        AuditReport
    """
    engine = AuditEngine()
    report = engine.run_audit(executed_by)

    # Auto-save to database for historical tracking
    if save_to_db:
        try:
            persistence = get_persistence()
            persistence.save_audit_run(report)
            print(f"✅ Saved audit run {report.id} to database")
        except Exception as e:
            print(f"⚠️ Failed to save to database: {str(e)}")
            # Continue anyway - file report still works

    return report
