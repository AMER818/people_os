"""
Audit Notifications
Handles sending alerts for critical audit findings.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .models import AuditReport

# Mock configuration for POC
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.example.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "audit@example.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "secret")
ALERT_RECIPIENT = os.getenv("ALERT_RECIPIENT", "admin@example.com")


def send_critical_alert(report: AuditReport):
    """
    Send email alert if report has critical findings.
    """
    if report.critical_count == 0 and report.risk_level != "Critical":
        return

    print(
        f"⚠️ Triggering Critical Alert for Report containing {report.critical_count} critical issues..."
    )

    subject = f"CRITICAL: System Audit Alert - Score {report.overall_score}/5.0"

    body = f"""
    SYSTEM HEALTH ALERT
    ===================
    
    Overall Score: {report.overall_score}/5.0
    Risk Level: {report.risk_level}
    
    Critical Findings: {report.critical_count}
    Major Findings: {report.major_count}
    
    CRITICAL ISSUES:
    ----------------
    """

    for finding in report.critical_findings:
        body += f"- [{finding.title}] {finding.description}\n"

    body += (
        f"\nView full report: http://localhost:{api_config.PORT}/audit-dashboard/reports/{report.id}"
    )

    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = ALERT_RECIPIENT
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        # For POC, we just print the email content instead of failing on connection
        # server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        # server.starttls()
        # server.login(SMTP_USER, SMTP_PASSWORD)
        # server.send_message(msg)
        # server.quit()

        print("\n" + "=" * 40)
        print("MOCK EMAIL SENT")
        print(f"To: {ALERT_RECIPIENT}")
        print(f"Subject: {subject}")
        print("content_length:", len(body))
        print("=" * 40 + "\n")

    except Exception as e:
        print(f"Failed to send alert email: {e}")
