import subprocess
from pathlib import Path

from ..models import CleanerResult, CleanupAction
from .base import BaseCleaner


class CodeCleaner(BaseCleaner):
    def __init__(self):
        super().__init__()
        self.project_root = Path(__file__).parent.parent.parent.parent

    def analyze(self) -> CleanerResult:
        # Check if black/isort would make changes
        actions = []

        # Check Black
        try:
            # --check returns 1 if changes needed, 0 if not
            cmd = ["black", "--check", str(self.project_root / "backend")]
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                actions.append(
                    CleanupAction(
                        description="Run Black Formatter on backend/",
                        items_count=1,
                        space_reclaimed_mb=0,  # Optimization, not space
                        status="Pending",
                        details=["black"],
                    )
                )
        except FileNotFoundError:
            pass  # Black not installed

        # Check Isort
        try:
            cmd = ["isort", "--check-only", str(self.project_root / "backend")]
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                actions.append(
                    CleanupAction(
                        description="Run Isort on backend/",
                        items_count=1,
                        space_reclaimed_mb=0,
                        status="Pending",
                        details=["isort"],
                    )
                )
        except FileNotFoundError:
            pass

        return CleanerResult(
            cleaner_name=self.name, actions=actions, total_reclaimed_mb=0, success=True
        )

    def execute(self, result: CleanerResult) -> CleanerResult:
        executed_actions = []

        for action in result.actions:
            if action.status == "Pending":
                tool = action.details[0]
                try:
                    if tool == "black":
                        subprocess.run(
                            ["black", str(self.project_root / "backend")], check=True
                        )
                    elif tool == "isort":
                        subprocess.run(
                            ["isort", str(self.project_root / "backend")], check=True
                        )

                    action.status = "Executed"
                except Exception as e:
                    action.status = "Failed"
                    action.details.append(str(e))

            executed_actions.append(action)

        result.actions = executed_actions
        return result
