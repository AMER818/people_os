import os
import time
from pathlib import Path

from ..models import CleanerResult, CleanupAction
from .base import BaseCleaner


class LocalStorageCleaner(BaseCleaner):
    def __init__(
        self, backup_dir: str = "backend/data/backups", retention_days: int = 7
    ):
        super().__init__()
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.backup_dir = self.project_root / backup_dir
        self.retention_days = retention_days

    def analyze(self) -> CleanerResult:
        actions = []
        total_reclaimable = 0.0

        if not self.backup_dir.exists():
            return CleanerResult(
                cleaner_name=self.name, actions=[], total_reclaimed_mb=0, success=True
            )

        cutoff_time = time.time() - (self.retention_days * 86400)

        for file_path in self.backup_dir.glob("*"):
            if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                size_mb = file_path.stat().st_size / (1024 * 1024)
                actions.append(
                    CleanupAction(
                        description=f"Delete old backup: {file_path.name}",
                        items_count=1,
                        space_reclaimed_mb=size_mb,
                        status="Pending",
                        details=[str(file_path)],
                    )
                )
                total_reclaimable += size_mb

        return CleanerResult(
            cleaner_name=self.name,
            actions=actions,
            total_reclaimed_mb=total_reclaimable,
            success=True,
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
                        action.status = "Skipped"
                except Exception as e:
                    action.status = "Failed"
                    action.details.append(str(e))
            executed_actions.append(action)

        result.actions = executed_actions
        result.total_reclaimed_mb = reclaimed_mb
        return result
