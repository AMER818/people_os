"""
Audit Scheduler
Uses APScheduler to run periodic system audits.
"""

import logging
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .audit_engine import ReportGenerator, run_system_audit

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def scheduled_audit_job():
    """Wrapper to run audit and save report"""
    try:
        print("⏰ Running Scheduled System Audit...")
        report = run_system_audit(executed_by="System Scheduler")
        reports_dir = Path(__file__).parent.parent / "data" / "reports"
        ReportGenerator.save_report(report, reports_dir)
        print(f"✅ Scheduled Audit Complete. Score: {report.overall_score}")

        # Check for critical alerts
        from .notifications import send_critical_alert

        send_critical_alert(report)
    except Exception as e:
        print(f"❌ Scheduled Audit Failed: {e}")
        logger.error(f"Scheduled audit failed: {e}", exc_info=True)


def start_scheduler():
    """Start the background scheduler"""
    if not scheduler.running:
        scheduler.start()
        print("[INFO] Audit Scheduler Started")


def configure_schedule(cron_expression: str):
    """
    Update the audit schedule.
    cron_expression: e.g. "0 18 * * 5" (Fri 18:00) or simple "interval:60"
    NOTE: For simplicity in this POC, we support basic intervals or fixed daily times.
    Real implementation would parse complex cron strings.
    """
    # Clear existing jobs
    scheduler.remove_all_jobs()

    # Heuristic parsing for the POC
    if cron_expression == "daily":
        # Run every day at midnight
        trigger = CronTrigger(hour=0, minute=0)
    elif cron_expression == "weekly":
        # Run every Friday at 6 PM
        trigger = CronTrigger(day_of_week="fri", hour=18, minute=0)
    elif cron_expression.startswith("interval:"):
        # Run every X minutes
        minutes = int(cron_expression.split(":")[1])
        scheduler.add_job(scheduled_audit_job, "interval", minutes=minutes)
        return
    else:
        # Default to weekly if unknown
        trigger = CronTrigger(day_of_week="fri", hour=18, minute=0)

    scheduler.add_job(scheduled_audit_job, trigger)
