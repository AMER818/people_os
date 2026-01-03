"""
Quick test script to verify audit engine functionality
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path

from backend.audit import ReportGenerator, run_system_audit


def test_audit_engine():
    """Test the audit engine"""
    print("=" * 60)
    print("SYSTEM AUDIT TEST")
    print("=" * 60)

    # Run audit
    print("\n[1/3] Running system audit...")
    report = run_system_audit(executed_by="test_admin")

    print(f"\n[2/3] Audit completed in {report.execution_time_seconds:.1f}s")
    print(f"    Overall Score: {report.overall_score}/5.0")
    print(f"    Risk Level: {report.risk_level}")
    print(f"    Critical Findings: {report.critical_count}")
    print(f"    Major Findings: {report.major_count}")
    print(f"    Minor Findings: {report.minor_count}")

    # Show dimension scores
    print("\n    Dimension Scores:")
    for dim_score in report.dimension_scores:
        print(f"      - {dim_score.dimension}: {dim_score.score}/5.0")

    # Generate report
    print("\n[3/3] Generating markdown report...")
    reports_dir = Path(__file__).parent.parent / "audit_reports"
    report_path = ReportGenerator.save_report(report, reports_dir)
    print(f"    Report saved to: {report_path}")

    print("\n" + "=" * 60)
    print("TEST COMPLETE ✓")
    print("=" * 60)

    return report


if __name__ == "__main__":
    test_audit_engine()
