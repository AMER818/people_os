
import sys
import os
import datetime
from pathlib import Path
from typing import Dict, List

# Setup paths
project_root = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, project_root)

# Import All Analyzers
from backend.audit.analyzers.ui_ux import UIUXAnalyzer
from backend.audit.analyzers.database import DatabaseAnalyzer
from backend.audit.analyzers.api_stability import APIAnalyzer
from backend.audit.analyzers.architecture import ArchitectureAnalyzer
from backend.audit.analyzers.code_quality import CodeQualityAnalyzer
from backend.audit.analyzers.security import SecurityAnalyzer
from backend.audit.analyzers.ai_layer import AILayerAnalyzer

def run_project_wide_audit():
    print("🚀 Starting FULL PROJECT 'BOTH ENDS' Audit...")
    print(f"   Target: {project_root}")
    
    analyzers = {
        "UI/UX (Frontend)": UIUXAnalyzer(),
        "Database (Schema)": DatabaseAnalyzer(),
        "API (Backend)": APIAnalyzer(),
        "Architecture": ArchitectureAnalyzer(project_root),
        "Code Quality": CodeQualityAnalyzer(),
        "Security": SecurityAnalyzer(),
        "AI Layer": AILayerAnalyzer()
    }
    
    report_lines = []
    report_lines.append("# Project-Wide 'Both Ends' Audit Report")
    report_lines.append(f"**Date:** {datetime.datetime.now().isoformat()}")
    report_lines.append("")
    
    total_score = 0
    dimension_count = 0
    
    for name, analyzer in analyzers.items():
        print(f"   Running analyzer: {name}...")
        try:
            result = analyzer.analyze()
            score_obj = result.get("score")
            findings = result.get("findings", [])
            
            score_val = score_obj.score if score_obj else 0
            total_score += score_val
            dimension_count += 1
            
            report_lines.append(f"## {name}")
            report_lines.append(f"- **Score**: {score_val:.2f} / 5.0")
            if score_obj and score_obj.details:
                report_lines.append("- **Metrics**:")
                for k, v in score_obj.details.items():
                    report_lines.append(f"  - {k}: {v}")
            
            if findings:
                report_lines.append("- **Findings**:")
                for f in findings:
                    icon = "🔴" if f.severity == "Critical" else "🟡" if f.severity == "Major" else "🔵"
                    report_lines.append(f"  - {icon} **{f.severity}**: {f.title} ({f.description})")
            else:
                report_lines.append("- ✅ No findings.")
            
            report_lines.append("")
            
        except Exception as e:
            print(f"   ❌ Analyzer {name} Failed: {e}")
            report_lines.append(f"## {name}")
            report_lines.append(f"- **Status**: FAILED ({e})")
            report_lines.append("")

    # Summary
    if dimension_count > 0:
        overall_avg = total_score / dimension_count
    else:
        overall_avg = 0
        
    report_lines.insert(2, f"**Overall System Health Score:** {overall_avg:.2f} / 5.0")
    
    # Save Report
    report_path = os.path.join(project_root, "backend", "data", "reports", "project_wide_both_ends_audit.md")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
        
    print(f"\n✅ Audit Complete. Overall Score: {overall_avg:.2f}")
    print(f"📄 Report saved to: {report_path}")

if __name__ == "__main__":
    run_project_wide_audit()
