"""
Testing Analyzer
Checks test coverage, flaky tests, regression gaps.
"""

import uuid
from pathlib import Path
from typing import Dict, List

from ..models import AuditFinding, DimensionScore
from ..utils import (calculate_score, count_files_by_extension,
                     get_project_root, run_command_safe)


class TestingAnalyzer:
    """Analyzes testing quality"""

    def __init__(self):
        self.project_root = get_project_root()

    def analyze(self) -> Dict:
        """Run testing analysis"""
        findings = []
        metrics = {
            "test_coverage": 0,
            "total_tests": 0,
            "test_files": 0,
            "untested_critical_paths": 0,
        }

        # 1. Count test files
        test_patterns = [".test.tsx", ".test.ts", ".spec.ts", "test_*.py", "test.py"]
        test_files = 0
        for pattern in test_patterns:
            files = list(self.project_root.rglob(pattern))
            # Filter out node_modules and venv
            files = [
                f
                for f in files
                if "node_modules" not in str(f) and "venv" not in str(f)
            ]
            test_files += len(files)
        metrics["test_files"] = test_files

        # 2. Run Playwright tests check
        playwright_config = self.project_root / "playwright.config.ts"
        if playwright_config.exists():
            # Check E2E tests
            e2e_dir = self.project_root / "tests" / "e2e"
            if e2e_dir.exists():
                metrics["total_tests"] += count_files_by_extension(
                    e2e_dir, [".spec.ts"]
                )

        # 3. Check for critical paths without tests
        critical_files = ["backend/main.py", "backend/auth.py", "backend/crud.py"]

        for critical_file in critical_files:
            file_path = self.project_root / critical_file
            if file_path.exists():
                # Check for test in same dir or tests/ subdir
                test_name = f"test_{file_path.name}"
                test_in_dir = file_path.parent / test_name
                test_in_tests = file_path.parent / "tests" / test_name

                if not test_in_dir.exists() and not test_in_tests.exists():
                    metrics["untested_critical_paths"] += 1
                    findings.append(
                        AuditFinding(
                            id=str(uuid.uuid4()),
                            dimension="Testing",
                            severity="Major",
                            title=f"Critical file {critical_file} lacks tests",
                            description="No corresponding test file found",
                            recommendation=f"Create {test_name} in backend/tests/",
                            file_path=str(file_path),
                        )
                    )

        # 4. Estimate coverage (rough heuristic)
        # Count backend python files
        backend_files = list((self.project_root / "backend").rglob("*.py"))
        backend_files = [
            f
            for f in backend_files
            if "venv" not in str(f) and "__pycache__" not in str(f)
        ]

        # Count frontend source files (excluding node_modules)
        frontend_src = self.project_root / "src"
        frontend_files = []
        if frontend_src.exists():
            frontend_files = list(frontend_src.rglob("*.tsx")) + list(
                frontend_src.rglob("*.ts")
            )

        # Also check separate modules dir if it exists
        modules_dir = self.project_root / "modules"
        if modules_dir.exists():
            frontend_files += list(modules_dir.rglob("*.tsx")) + list(
                modules_dir.rglob("*.ts")
            )

        total_code_files = len(backend_files) + len(frontend_files)
        total_code_files = max(1, total_code_files)

        # Enhanced coverage estimation with E2E test weighting
        # E2E tests count more heavily since they test multiple components
        e2e_test_bonus = 0
        if metrics["total_tests"] > 10:
            e2e_test_bonus = min(20, metrics["total_tests"] * 2)  # Each E2E test = 2% coverage
        
        # Integration tests also count
        integration_tests = len(list((self.project_root / "tests" / "integration").rglob("*.test.ts"))) if (self.project_root / "tests" / "integration").exists() else 0
        integration_bonus = min(15, integration_tests * 1.5)
        
        coverage_estimate = min(100, int((test_files / max(total_code_files, 1)) * 100) + e2e_test_bonus + integration_bonus)
        metrics["test_coverage"] = coverage_estimate

        if coverage_estimate < 50:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="Testing",
                    severity="Major",
                    title=f"Test coverage estimated at {coverage_estimate}%",
                    description="Low test coverage detected",
                    recommendation="Add unit tests for core modules",
                )
            )

        # 5. Calculate Score with enhanced E2E weighting
        # E2E tests significantly reduce risk even if coverage estimate is moderate
        base_score = calculate_score(
            {
                "test_coverage": coverage_estimate / 20,  # 100% = 5.0
                "untested_critical_paths": max(0, 5 - metrics["untested_critical_paths"]),
            }
        )
        
        # Boost score if we have good E2E coverage
        if metrics["total_tests"] >= 15:
            base_score = min(5.0, base_score + 1.5)  # +1.5 boost for comprehensive E2E
        elif metrics["total_tests"] >= 10:
            base_score = min(5.0, base_score + 1.0)  # +1.0 boost for good E2E
        
        # Ensure score reflects quality of testing infrastructure
        if integration_tests >= 5 and metrics["total_tests"] >= 10:
            base_score = min(5.0, base_score + 0.5)

        return {
            "score": DimensionScore(
                dimension="Testing",
                score=base_score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }
