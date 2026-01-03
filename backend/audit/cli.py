"""
CLI entry point for system audit.
Can be called via npm run audit.
"""

import json
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.audit.audit_engine import run_system_audit
from backend.audit.report_generator import ReportGenerator


def main():
    print("[AUDIT] Starting Comprehensive System Audit...")
    print("Dimensions: 9/9 | Mode: Audit-as-Code")
    print("-" * 40)

    try:
        # Run audit
        report = run_system_audit(executed_by="CLI-Runner", save_to_db=True)

        # Generate markdown report
        generator = ReportGenerator()
        reports_dir = Path("backend/data/reports")
        report_path = generator.save_report(report, reports_dir)

        print("\n" + "=" * 40)
        print(f"📊 Audit Complete: {report.overall_score}/5.0")
        print(f"Risk Level: {report.risk_level}")
        print(f"Findings: {report.critical_count} critical, {report.major_count} major")
        print("=" * 40)

        print(f"\n[OK] Markdown report generated: {report_path}")

        # Performance check
        print(f"⏱️  Execution time: {report.execution_time_seconds:.1f}s")

        # Exit codes based on release gates (simplified)
        if report.critical_count > 0 or report.overall_score < 3.0:
            print("\n[BLOCKED] RELEASE BLOCKED: System health below threshold.")
            sys.exit(1)

        print("\n[OK] RELEASE READY: System health meets requirements.")
        sys.exit(0)

    except Exception as e:
        print(f"\n[ERROR] Audit failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
