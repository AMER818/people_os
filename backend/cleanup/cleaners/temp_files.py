import os
import shutil
import time
from pathlib import Path

from ..models import CleanerResult, CleanupAction
from .base import BaseCleaner


class TempFileCleaner(BaseCleaner):
    def __init__(self, tmp_dirs: list = ["tmp", "cache"], retention_hours: int = 24):
        super().__init__()
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.tmp_dirs = [self.project_root / d for d in tmp_dirs]
        self.retention_hours = retention_hours

        # System Cache patterns to target recursively
        self.cache_patterns = [
            "__pycache__",
            ".pytest_cache",
            ".mypy_cache",
            ".ruff_cache",
        ]

    def analyze(self) -> CleanerResult:
        actions = []
        total_reclaimable = 0.0
        cutoff_time = time.time() - (self.retention_hours * 3600)

        # 1. Clean Explicit Temp Dirs
        for tmp_dir in self.tmp_dirs:
            if not tmp_dir.exists():
                continue

            try:
                # Walk through directory
                for root, dirs, files in os.walk(tmp_dir):
                    for file in files:
                        file_path = Path(root) / file
                        try:
                            if file_path.stat().st_mtime < cutoff_time:
                                size_mb = file_path.stat().st_size / (1024 * 1024)
                                actions.append(
                                    CleanupAction(
                                        description=f"Delete temp file: {file}",
                                        items_count=1,
                                        space_reclaimed_mb=size_mb,
                                        status="Pending",
                                        details=[str(file_path)],
                                    )
                                )
                                total_reclaimable += size_mb
                        except OSError:
                            pass  # Skip files disappearing or locked
            except Exception as e:
                pass

        # 2. Clean System Caches (Recursive)
        try:
            for root, dirs, files in os.walk(self.project_root):
                # Modify dirs in-place to skip node_modules etc
                if "node_modules" in dirs:
                    dirs.remove("node_modules")
                if ".git" in dirs:
                    dirs.remove(".git")

                # Check for cache directories to remove
                for pattern in self.cache_patterns:
                    if pattern in dirs:
                        cache_path = Path(root) / pattern
                        # Calculate size
                        size_mb = 0.0
                        for r, _, f in os.walk(cache_path):
                            for file in f:
                                try:
                                    size_mb += (Path(r) / file).stat().st_size
                                except:
                                    pass
                        size_mb /= 1024 * 1024

                        actions.append(
                            CleanupAction(
                                description=f"Remove system cache: {pattern} in {Path(root).name}",
                                items_count=1,  # Treating dir as 1 item
                                space_reclaimed_mb=size_mb,
                                status="Pending",
                                details=[str(cache_path), "directory"],
                            )
                        )
                        total_reclaimable += size_mb
                        # Don't descend into it if we are deleting it
                        dirs.remove(pattern)
        except Exception as e:
            pass

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
                    path_str = action.details[0]
                    is_dir = (
                        len(action.details) > 1 and action.details[1] == "directory"
                    )
                    path = Path(path_str)

                    if path.exists():
                        if is_dir:
                            shutil.rmtree(path)
                        else:
                            os.remove(path)
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
