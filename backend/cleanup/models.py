from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel


class CleanupAction(BaseModel):
    description: str
    items_count: int
    space_reclaimed_mb: float
    status: str  # "Pending", "Executed", "Skipped", "Failed"
    details: Optional[List[str]] = None


class CleanerResult(BaseModel):
    cleaner_name: str
    actions: List[CleanupAction]
    total_reclaimed_mb: float
    success: bool
    error: Optional[str] = None


class CleanupReport(BaseModel):
    id: str
    timestamp: datetime
    execution_time_seconds: float
    dry_run: bool
    total_reclaimed_mb: float
    cleaner_results: List[CleanerResult]
    scope: str
