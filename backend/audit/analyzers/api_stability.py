"""
API & Contract Stability Analyzer
Checks API consistency, versioning, error response shapes, and breaking changes against baseline.
"""

import json
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List

from fastapi.openapi.utils import get_openapi

from backend.audit.models import ActionItem, AuditFinding, DimensionScore
from backend.audit.utils import calculate_score, get_project_root


class APIAnalyzer:
    """Analyzes API quality and stability"""

    def __init__(self):
        self.project_root = get_project_root()
        self.baseline_path = (
            self.project_root / "backend" / "data" / "baseline_openapi.json"
        )

    def analyze(self) -> Dict:
        """Run API analysis"""
        # Lazy import to avoid circular dependency
        app = None
        import_error = None
        try:
            import sys
            import os

            # Get project root correctly
            project_root = str(Path(__file__).resolve().parent.parent.parent.parent)
            backend_dir = os.path.join(project_root, "backend")
            
            # Add both project root and backend to path
            if project_root not in sys.path:
                sys.path.insert(0, project_root)
            if backend_dir not in sys.path:
                sys.path.insert(0, backend_dir)
            
            # Try importing as module first, then as direct import
            try:
                # Suppress warnings when importing main (which has many dependencies)
                import warnings
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    from backend.main import app
            except (ImportError, ModuleNotFoundError) as ie:
                # Try relative import if running from backend directory
                import_error = ie
                try:
                    import main as app_module
                    app = app_module.app
                except (ImportError, AttributeError, ModuleNotFoundError) as e2:
                    import_error = e2
                    app = None
        except (ImportError, AttributeError, ModuleNotFoundError) as e:
            import_error = e
            app = None
        
        if import_error and app is None:
            # Silently handle import errors (they're expected if dependencies are missing)
            # The API analysis will degrade gracefully
            pass

        findings = []
        metrics = {
            "total_endpoints": 0,
            "versioned_endpoints": 0,
            "breaking_changes": 0,
            "new_endpoints": 0,
            "schema_size_kb": 0,
        }

        if not app:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="API",
                    severity="Major",
                    title="Could not load FastAPI app",
                    description="Failed to import 'app' from backend.main for inspection. This is expected if optional dependencies are missing.",
                    recommendation="Ensure all dependencies are installed. Run: pip install -r backend/requirements.txt",
                )
            )
            return {
                "score": DimensionScore(
                    dimension="API", score=0.0, findings_count=1, details=metrics
                ),
                "findings": findings,
            }

        try:
            # 1. Generate current OpenAPI schema
            current_schema = get_openapi(
                title=app.title,
                version=app.version,
                openapi_version=app.openapi_version,
                description=app.description,
                routes=app.routes,
            )

            # Serialize for comparison/storage
            current_json = json.dumps(current_schema, sort_keys=True)
            metrics["schema_size_kb"] = len(current_json) // 1024

            paths = current_schema.get("paths", {})
            metrics["total_endpoints"] = len(paths)

            # 2. Check Versioning (e.g. /api/v1/)
            # Improved heuristic: check if paths start with /api/v[0-9] or if global prefix exists
            versioned_count = 0
            for path in paths.keys():
                if re.search(r"/v[0-9]+/", path) or path.startswith("/api/"):
                    # We consider /api/ as "some" structuring even if not strict semantic versioning
                    # But strict requirement should be /v1/
                    if "/v" in path:
                        versioned_count += 1

            metrics["versioned_endpoints"] = versioned_count

            if metrics["total_endpoints"] > 0 and metrics["versioned_endpoints"] == 0:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="API",
                        severity="Minor",
                        title="No explicit API versioning",
                        description="Endpoints do not use /v1/ or similar prefixes.",
                        recommendation="Adopt URI versioning (e.g. /api/v1/resource).",
                    )
                )

            # 3. Compare with Baseline
            if self.baseline_path.exists():
                baseline_schema = json.loads(
                    self.baseline_path.read_text(encoding="utf-8")
                )
                diff_findings, stats = self._compare_schemas(
                    baseline_schema, current_schema
                )
                findings.extend(diff_findings)
                metrics["breaking_changes"] = stats["breaking"]
                metrics["new_endpoints"] = stats["new"]

                # Update baseline if no breaking changes?
                # Or explicit update required?
                # For Audit-as-Code, we might want to auto-update ONLY if safe.
                # But typically we want a "golden" baseline.
                # Let's auto-update for now to treat "current" as the new "truth" if reliable
                # OR just comparing to "previous run". This implementation treats it as "previous run comparison".
                self.baseline_path.write_text(
                    json.dumps(current_schema, indent=2), encoding="utf-8"
                )
            else:
                # First run, establish baseline
                self.baseline_path.parent.mkdir(parents=True, exist_ok=True)
                self.baseline_path.write_text(
                    json.dumps(current_schema, indent=2), encoding="utf-8"
                )
                metrics["new_endpoints"] = len(paths)  # All are new

        except Exception as e:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="API",
                    severity="Major",
                    title="API Analysis Failed",
                    description=str(e),
                    recommendation="Debug analyzer exception.",
                )
            )

        # Score calculation
        # Deduct for breaking changes
        # Reward versioning
        score = calculate_score(
            {
                "braking_changes": max(
                    0, 5 - (metrics["breaking_changes"] * 2)
                ),  # -2 per breaking change
                "versioning": (
                    metrics["versioned_endpoints"] / max(1, metrics["total_endpoints"])
                )
                * 5,
                "completeness": 5.0,  # Placeholder
            }
        )

        return {
            "score": DimensionScore(
                dimension="API",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
            "findings": findings,
        }

    def _compare_schemas(
        self, baseline: Dict, current: Dict
    ) -> tuple[List[AuditFinding], Dict]:
        findings = []
        stats = {"breaking": 0, "new": 0}

        base_paths = set(baseline.get("paths", {}).keys())
        curr_paths = set(current.get("paths", {}).keys())

        # 3.1 Check Removed Paths (Breaking)
        removed_paths = base_paths - curr_paths
        for path in removed_paths:
            stats["breaking"] += 1
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="API",
                    severity="Critical",  # Breaking change!
                    title=f"Breaking Change: Endpoint Removed",
                    description=f"Endpoint '{path}' was removed from API.",
                    recommendation="Restore endpoint or bump API version.",
                )
            )

        # 3.2 Check New Paths
        new_paths = curr_paths - base_paths
        stats["new"] = len(new_paths)

        # 3.3 Check Method Changes in existing paths
        common_paths = base_paths.intersection(curr_paths)
        for path in common_paths:
            base_methods = set(baseline["paths"][path].keys())
            curr_methods = set(current["paths"][path].keys())

            removed_methods = base_methods - curr_methods
            for method in removed_methods:
                stats["breaking"] += 1
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="API",
                        severity="Major",
                        title=f"Breaking Change: Method Removed",
                        description=f"Method '{method.upper()}' removed from '{path}'.",
                        recommendation="Restore method support.",
                    )
                )

        return findings, stats
