"""
Audit Report Generator
Generates standardized markdown reports.
"""

from datetime import datetime
from pathlib import Path
from typing import List

from .models import ActionItem, AuditFinding, AuditReport


class ReportGenerator:
    """Generates standardized audit reports"""

    @staticmethod
    def generate_markdown(report: AuditReport) -> str:
        """Generate markdown report following standard template"""

        md = f"""# System Audit Report

**Date:** {report.created_at.strftime("%Y-%m-%d %H:%M:%S")}  
**Version:** {report.version}  
**Scope:** {report.scope}  
**Executed By:** {report.executed_by}  
**Execution Time:** {report.execution_time_seconds:.1f}s

---

## 1. Executive Summary

**Overall Health Score:** `{report.overall_score:.1f} / 5.0`  
**Risk Level:** `{report.risk_level}`

### Issue Summary
- 🔴 **Critical Issues:** {report.critical_count}
- 🟡 **Major Issues:** {report.major_count}
- 🔵 **Minor Issues:** {report.minor_count}

---

## 2. Dimension Scores

| Dimension | Score | Findings | Status |
|-----------|-------|----------|--------|
"""

        for dim_score in report.dimension_scores:
            status_emoji = (
                "[OK]"
                if dim_score.score >= 4.0
                else "[WARN]" if dim_score.score >= 3.0 else "[FAIL]"
            )
            md += f"| {dim_score.dimension} | {dim_score.score:.1f}/5.0 | {dim_score.findings_count} | {status_emoji} |\n"

        md += "---\n\n"

        # Policy Results
        if report.policy_results:
            md += "## 3. Quality Gate Status\n\n"
            md += "| Policy | Status | Rule | Enforced |\n"
            md += "|--------|--------|------|----------|\n"
            for policy in report.policy_results:
                status = "[PASS]" if policy.pass_status else "[FAIL]"
                enforced = "[REQUIRED]" if policy.enforced else "[OPTIONAL]"
                md += f"| {policy.name} | {status} | `{policy.rule}` | {enforced} |\n"
            md += "\n---\n\n"

        # Critical Findings
        if report.critical_findings:
            md += "## 3. 🔴 Critical Findings\n\n"
            for finding in report.critical_findings:
                md += f"### {finding.title}\n\n"
                md += f"**Dimension:** {finding.dimension}  \n"
                md += f"**Description:** {finding.description}\n\n"
                md += f"**Recommendation:** {finding.recommendation}\n\n"
                if finding.file_path:
                    md += f"**File:** `{finding.file_path}`"
                    if finding.line_number:
                        md += f":{finding.line_number}"
                    md += "\n\n"
                md += "---\n\n"

        # Major Findings
        if report.major_findings:
            md += "## 4. 🟡 Major Findings\n\n"
            for finding in report.major_findings:
                md += f"### {finding.title}\n\n"
                md += f"**Dimension:** {finding.dimension}  \n"
                md += f"**Description:** {finding.description}\n\n"
                md += f"**Recommendation:** {finding.recommendation}\n\n"
                if finding.file_path:
                    md += f"**File:** `{finding.file_path}`\n\n"
                md += "---\n\n"

        # Technical Debt
        if report.technical_debt:
            md += "## 5. Technical Debt Register\n\n"
            md += "| Item | Area | Impact | Effort |\n"
            md += "|------|------|--------|--------|\n"
            for debt in report.technical_debt:
                md += f"| {debt.issue} | {debt.area} | {debt.priority} | {debt.effort} |\n"
            md += "\n---\n\n"

        # Action Plan
        if report.action_plan:
            md += "## 6. Action Plan\n\n"
            md += "| Issue | Owner | Priority | ETA |\n"
            md += "|-------|-------|----------|-----|\n"
            for action in report.action_plan:
                owner = action.owner or "Unassigned"
                eta = action.eta or "TBD"
                md += f"| {action.issue} | {owner} | {action.priority} | {eta} |\n"
            md += "\n---\n\n"

        # Risk Assessment
        md += "## 7. Risks & Assumptions\n\n"
        if report.risk_level == "Critical":
            md += "⛔ **System has critical vulnerabilities that must be addressed immediately.**\n\n"
        elif report.risk_level == "High":
            md += "[WARN] **System has significant risks that should be prioritized.**\n\n"
        elif report.risk_level == "Medium":
            md += "[INFO] **System risk is manageable with planned improvements.**\n\n"
        else:
            md += "[OK] **System risk is low. Continue monitoring.**\n\n"

        md += "### Assumptions\n"
        md += "- All tests executed in current environment\n"
        md += "- Static analysis tools are up-to-date\n"
        md += "- Manual review items deferred to follow-up\n\n"

        md += "---\n\n"

        # Sign-off
        md += "## 8. Audit Sign-off\n\n"
        md += f"**Reviewed By:** {report.executed_by}  \n"
        md += f"**Approved By:** _Pending Review_  \n"
        md += f"**Next Audit Due:** {(report.created_at.replace(month=report.created_at.month + 1)).strftime('%Y-%m-%d')}\n"

        return md

        return md

    @staticmethod
    def generate_pdf(report: AuditReport, output_path: Path):
        """Generate PDF report"""
        try:
            from fpdf import FPDF
        except ImportError:
            print("Warning: fpdf not installed. Skipping PDF generation.")
            return

        class AuditPDF(FPDF):
            def header(self):
                self.set_font("Arial", "B", 10)
                self.cell(0, 10, "Hunzal PeopleOS - System Audit Report", 0, 1, "R")
                self.line(10, 20, 200, 20)
                self.ln(10)

            def footer(self):
                self.set_y(-15)
                self.set_font("Arial", "I", 8)
                self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", 0, 0, "C")

            def chapter_title(self, title):
                self.set_font("Arial", "B", 14)
                self.cell(0, 10, title, 0, 1, "L")
                self.ln(2)

            def chapter_body(self, body):
                self.set_font("Arial", "", 11)
                self.multi_cell(0, 6, body)
                self.ln()

            def finding_block(self, title, severity, description, recommendation):
                self.set_font("Arial", "B", 11)
                if severity == "Critical":
                    self.set_text_color(220, 53, 69)  # Red
                elif severity == "Major":
                    self.set_text_color(255, 193, 7)  # Yellow/Orange
                else:
                    self.set_text_color(0, 0, 0)

                self.cell(0, 8, f"[{severity}] {title}", 0, 1)
                self.set_text_color(0, 0, 0)

                self.set_font("Arial", "", 10)
                self.multi_cell(0, 5, f"Description: {description}")
                self.multi_cell(0, 5, f"Recommendation: {recommendation}")
                self.ln(4)

        pdf = AuditPDF()
        pdf.alias_nb_pages()
        pdf.add_page()

        # Title
        pdf.set_font("Arial", "B", 24)
        pdf.cell(0, 20, "System Audit Report", 0, 1, "C")
        pdf.ln(10)

        # Overview Box
        pdf.set_fill_color(240, 240, 240)
        pdf.rect(10, 50, 190, 40, "F")
        pdf.set_y(55)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(90, 8, f"Overall Score: {report.overall_score:.1f} / 5.0", 0, 0)
        pdf.cell(90, 8, f"Risk Level: {report.risk_level}", 0, 1)
        pdf.set_font("Arial", "", 11)
        pdf.cell(90, 8, f"Date: {report.created_at.strftime('%Y-%m-%d')}", 0, 0)
        pdf.cell(90, 8, f"Scope: {report.scope}", 0, 1)
        pdf.ln(20)

        # Dimensions
        pdf.chapter_title("1. Dimension Scores")

        pdf.set_font("Arial", "B", 10)
        col_width = 45
        pdf.cell(col_width, 8, "Dimension", 1)
        pdf.cell(col_width, 8, "Score", 1)
        pdf.cell(col_width, 8, "Findings", 1)
        pdf.ln()

        pdf.set_font("Arial", "", 10)
        for dim in report.dimension_scores:
            pdf.cell(col_width, 8, dim.dimension, 1)
            pdf.cell(col_width, 8, f"{dim.score:.1f}", 1)
            pdf.cell(col_width, 8, str(dim.findings_count), 1)
            pdf.ln()

        pdf.ln(10)

        # Critical Findings
        if report.critical_findings:
            pdf.add_page()
            pdf.chapter_title("2. Critical Findings")
            for finding in report.critical_findings:
                pdf.finding_block(
                    finding.title,
                    finding.severity,
                    finding.description,
                    finding.recommendation,
                )

        # Major Findings
        if report.major_findings:
            pdf.chapter_title("3. Major Findings")
            for finding in report.major_findings:
                pdf.finding_block(
                    finding.title,
                    finding.severity,
                    finding.description,
                    finding.recommendation,
                )

        # Action Plan
        if report.action_plan:
            pdf.add_page()
            pdf.chapter_title("4. Action Plan")
            pdf.set_font("Arial", "B", 10)
            pdf.cell(90, 8, "Issue", 1)
            pdf.cell(40, 8, "Owner", 1)
            pdf.cell(30, 8, "Priority", 1)
            pdf.ln()
            pdf.set_font("Arial", "", 9)
            for action in report.action_plan:
                pdf.cell(90, 8, action.issue[:45], 1)
                pdf.cell(40, 8, (action.owner or "unassigned")[:18], 1)
                pdf.cell(30, 8, action.priority, 1)
                pdf.ln()

        try:
            pdf.output(str(output_path), "F")
        except Exception as e:
            print(f"Error saving PDF: {e}")

    @staticmethod
    def save_report(report: AuditReport, output_dir: Path) -> Path:
        """Save report to file"""
        output_dir.mkdir(parents=True, exist_ok=True)

        filename = f"audit_report_{report.id}.md"
        filepath = output_dir / filename

        # Save Markdown
        markdown_content = ReportGenerator.generate_markdown(report)
        filepath.write_text(markdown_content, encoding="utf-8")

        # Try to save PDF (optional - may fail if fpdf2 has issues)
        try:
            pdf_filename = f"audit_report_{report.id}.pdf"
            pdf_path = output_dir / pdf_filename
            ReportGenerator.generate_pdf(report, pdf_path)
        except Exception as e:
            # Silently skip PDF if there are rendering issues
            pass

        # Save JSON (for Diffing)
        json_filename = f"audit_report_{report.id}.json"
        json_path = output_dir / json_filename
        json_path.write_text(report.json(), encoding="utf-8")

        return filepath
