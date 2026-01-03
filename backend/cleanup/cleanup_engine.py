import time
import uuid
from datetime import datetime
from typing import List

from .cleaners.code_cleaner import CodeCleaner
from .cleaners.conflict_cleaner import ConflictCleaner
from .cleaners.database import DatabaseCleaner
from .cleaners.local_storage import LocalStorageCleaner
from .cleaners.logs import LogCleaner
from .cleaners.temp_files import TempFileCleaner
from .models import CleanerResult, CleanupReport


class CleanupEngine:
    def __init__(self):
        self.cleaners = [
            LogCleaner(),
            TempFileCleaner(),
            DatabaseCleaner(),
            CodeCleaner(),
            ConflictCleaner(),
            LocalStorageCleaner(),
        ]

    def run_cleanup(
        self, executed_by: str, dry_run: bool = True, target_cleaners: List[str] = None
    ) -> CleanupReport:
        start_time = time.time()
        report_id = f"cleanup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        results: List[CleanerResult] = []
        total_reclaimed = 0.0

        for cleaner in self.cleaners:
            if target_cleaners and cleaner.name not in target_cleaners:
                continue

            try:
                # 1. Analyze
                result = cleaner.analyze()

                # 2. Execute if not dry_run
                if not dry_run and result.success and result.actions:
                    result = cleaner.execute(result)

                results.append(result)
                total_reclaimed += result.total_reclaimed_mb
            except Exception as e:
                # Fail safe
                results.append(
                    CleanerResult(
                        cleaner_name=cleaner.name,
                        actions=[],
                        total_reclaimed_mb=0,
                        success=False,
                        error=f"Engine failed to run cleaner: {str(e)}",
                    )
                )

        execution_time = time.time() - start_time

        return CleanupReport(
            id=report_id,
            timestamp=datetime.now(),
            execution_time_seconds=execution_time,
            dry_run=dry_run,
            total_reclaimed_mb=total_reclaimed,
            cleaner_results=results,
            scope="Full System",
        )
