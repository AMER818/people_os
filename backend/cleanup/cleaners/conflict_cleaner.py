import os
from pathlib import Path

from ..models import CleanerResult, CleanupAction
from .base import BaseCleaner


class ConflictCleaner(BaseCleaner):
    def __init__(self):
        super().__init__()
        # Split strings to avoid self-detection
        self.markers = ["<<<<<<< " + "HEAD", "=======", ">>>>>>>"]

    def analyze(self) -> CleanerResult:
        actions = []

        # Scan backend source files
        # Limit to .py, .js, .ts, .tsx, .md, .html
        exts = {".py", ".js", ".ts", ".tsx", ".md", ".html", ".css", ".json"}

        for root, dirs, files in os.walk(self.project_root):
            if "node_modules" in dirs:
                dirs.remove("node_modules")
            if ".git" in dirs:
                dirs.remove(".git")
            if "__pycache__" in dirs:
                dirs.remove("__pycache__")

            for file in files:
                if Path(file).suffix not in exts:
                    continue

                file_path = Path(root) / file
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        if "<<<<<<< HEAD" in content and ">>>>>>>" in content:
                            actions.append(
                                CleanupAction(
                                    description=f"Merge Conflict detected in {file}",
                                    items_count=1,
                                    space_reclaimed_mb=0,
                                    status="Pending",
                                    details=[str(file_path)],
                                )
                            )
                except:
                    pass

        return CleanerResult(
            cleaner_name=self.name, actions=actions, total_reclaimed_mb=0, success=True
        )

    def execute(self, result: CleanerResult) -> CleanerResult:
        # We cannot safely auto-resolve conflicts.
        # This cleaner acts as a Reporter/Detector only.
        # But we mark as 'Skipped' (Manual Intervention Required)

        executed_actions = []
        for action in result.actions:
            if action.status == "Pending":
                action.status = "Skipped"
                action.details.append("Manual Resolution Required")
            executed_actions.append(action)

        result.actions = executed_actions
        return result
