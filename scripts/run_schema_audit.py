import sys
import os
import datetime
from pathlib import Path

# Setup paths
project_root = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, project_root)

from backend.audit.analyzers.database import DatabaseAnalyzer

def run_schema_audit():
    print("🔍 Starting Project-Wide Schema Audit...")
    try:
        analyzer = DatabaseAnalyzer()
        result = analyzer.analyze()
        
        score = result["score"].score
        findings = result["findings"]
        metrics = result["score"].details
        
        # Generate Report
        report_lines = []
        report_lines.append("# Project Schema Audit Report")
        report_lines.append(f"**Date:** {datetime.datetime.now().isoformat()}")
        report_lines.append(f"**Overall Schema Score:** {score} / 5.0")
        report_lines.append("")
        
        report_lines.append("## Metrics")
        for key, value in metrics.items():
            report_lines.append(f"- **{key}:** {value}")
        report_lines.append("")
        
        report_lines.append("## Findings")
        if not findings:
            report_lines.append("✅ No findings detected.")
        else:
            for finding in findings:
                icon = "🔴" if finding.severity == "Critical" else "🟡" if finding.severity == "Major" else "🔵"
                report_lines.append(f"### {icon} {finding.title}")
                report_lines.append(f"- **Severity:** {finding.severity}")
                report_lines.append(f"- **Description:** {finding.description}")
                report_lines.append(f"- **Recommendation:** {finding.recommendation}")
                report_lines.append("")
        
        # Save Report
        report_path = os.path.join(project_root, "backend", "data", "reports", "schema_audit_standalone.md")
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(report_lines))
            
        print(f"✅ Audit Complete. Score: {score}")
        print(f"📄 Report saved to: {report_path}")
        
    except Exception as e:
        print(f"❌ Audit Failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_schema_audit()
