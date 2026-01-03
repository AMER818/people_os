from sqlalchemy import text

from ...database import SessionLocal, engine
from ..models import CleanerResult, CleanupAction
from .base import BaseCleaner

# Assuming we will just use raw SQL for generic cleanup or specific models if available
# For safer cleanup, let's look for known tables with 'deleted_at' or similar if we had soft delete.
# But our current system doesn't seem to have standard soft-delete columns (isActive is boolean).
# We will focus on "orphaned" records if any, or just a dummy implementation for now as requested.
# Actually, let's implement a 'Candidate' cleanup for rejected candidates > 1 year old.


class DatabaseCleaner(BaseCleaner):
    def __init__(self):
        super().__init__()

    def analyze(self) -> CleanerResult:
        actions = []
        db = SessionLocal()
        try:
            # Example: Find rejected candidates applied > 1 year ago
            # Checking schema... Candidate has 'applied_date' (string) and 'current_stage'.

            # Use raw SQL for flexibility or simple check
            # For now, let's just count 'Rejected' candidates for demo

            # Note: We don't have a reliable 'soft delete' mechanism universal yet.
            # So we will implement a logic: "Audit Log Archival" - move old audit logs to file?
            # Or "Legacy Data Cleanup".

            # Let's clean Audit Logs > 90 days.
            # AuditLog has 'time' field.

            sql = text(
                "SELECT COUNT(*) FROM audit_logs WHERE time < date('now', '-90 days')"
            )
            # SQLite specific syntax above.

            # Adjusting for likely DB (SQLite default for this project?)
            # models.py shows AuditLog.

            count = db.execute(sql).scalar()

            if count > 0:
                actions.append(
                    CleanupAction(
                        description=f"Archive/Delete Audit Logs older than 90 days",
                        items_count=count,
                        space_reclaimed_mb=count * 0.0005,  # approx 0.5KB per log
                        status="Pending",
                        details=["audit_logs"],
                    )
                )

            return CleanerResult(
                cleaner_name=self.name,
                actions=actions,
                total_reclaimed_mb=sum(a.space_reclaimed_mb for a in actions),
                success=True,
            )
        except Exception as e:
            return CleanerResult(
                cleaner_name=self.name,
                actions=[],
                total_reclaimed_mb=0,
                success=False,
                error=str(e),
            )
        finally:
            db.close()

    def execute(self, result: CleanerResult) -> CleanerResult:
        db = SessionLocal()
        try:
            executed_actions = []
            reclaimed = 0.0

            for action in result.actions:
                if action.status == "Pending" and "Audit Logs" in action.description:
                    try:
                        # Perform Deletion
                        sql = text(
                            "DELETE FROM audit_logs WHERE time < date('now', '-90 days')"
                        )
                        db.execute(sql)
                        db.commit()
                        action.status = "Executed"
                        reclaimed += action.space_reclaimed_mb
                    except Exception as e:
                        db.rollback()
                        action.status = "Failed"
                        action.details.append(str(e))

                executed_actions.append(action)

            result.actions = executed_actions
            result.total_reclaimed_mb = reclaimed
            return result
        finally:
            db.close()
