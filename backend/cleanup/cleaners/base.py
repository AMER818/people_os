from abc import ABC, abstractmethod
from typing import List

from ..models import CleanerResult


class BaseCleaner(ABC):
    def __init__(self):
        self.name = self.__class__.__name__

    @abstractmethod
    def analyze(self) -> CleanerResult:
        """
        Analyze what needs to be cleaned.
        Should return a CleanerResult with actions having status="Pending" or "Skipped".
        """
        pass

    @abstractmethod
    def execute(self, result: CleanerResult) -> CleanerResult:
        """
        Execute the cleanup based on the analysis result.
        Update action statuses to "Executed".
        """
        pass
