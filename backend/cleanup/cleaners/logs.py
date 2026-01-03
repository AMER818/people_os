import os
import time
from pathlib import Path

from ..models import CleanerResult, CleanupAction
from .base import BaseCleaner


class LogCleaner(BaseCleaner):
    def __init__(self, logs_dir: str = "logs", retention_days: int = 30):
        super().__init__()
        # Resolve path relative to project root (2 levels up from backend/cleanup/cleaners)
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.logs_dir = self.project_root / logs_dir
        self.retention_days = retention_days

    def analyze(self) -> CleanerResult:
        actions = []
        total_reclaimable = 0.0

        if not self.logs_dir.exists():
            return CleanerResult(
                cleaner_name=self.name,
                actions=[],
                total_reclaimed_mb=0,
                success=True,
                error=f"Logs directory {self.logs_dir} does not exist",
            )

        cutoff_time = time.time() - (self.retention_days * 86400)

        try:
            for log_file in self.logs_dir.glob("*.log"):
                if log_file.stat().st_mtime < cutoff_time:
                    size_mb = log_file.stat().st_size / (1024 * 1024)
                    actions.append(
                        CleanupAction(
                            description=f"Delete old log: {log_file.name}",
                            items_count=1,
                            space_reclaimed_mb=size_mb,
                            status="Pending",
                            details=[str(log_file)],
                        )
                    )
                    total_reclaimable += size_mb

            return CleanerResult(
                cleaner_name=self.name,
                actions=actions,
                total_reclaimed_mb=total_reclaimable,
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

    def execute(self, result: CleanerResult) -> CleanerResult:
        executed_actions = []
        reclaimed_mb = 0.0

        for action in result.actions:
            if action.status == "Pending":
                try:
                    file_path = Path(action.details[0])
                    if file_path.exists():
                        os.remove(file_path)
                        action.status = "Executed"
                        reclaimed_mb += action.space_reclaimed_mb
                    else:
                        action.status = "Skipped"  # Already gone
                except Exception as e:
                    action.status = "Failed"
                    action.details.append(str(e))

            executed_actions.append(action)

        result.actions = executed_actions
        result.total_reclaimed_mb = reclaimed_mb
        return result
