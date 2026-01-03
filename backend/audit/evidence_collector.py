"""
Evidence Collector for Compliance Mode
Extracts results and logs for specific compliance controls.
"""

import json
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from ..persistence import get_persistence
from ..utils import get_project_root


class EvidenceCollector:
    """Collects evidence for audit readiness"""

    def __init__(self):
        self.root = get_project_root()
        self.persistence = get_persistence()
        with open(
            self.root / "backend" / "audit" / "compliance_mapping.json", "r"
        ) as f:
            self.mapping = json.load(f)

    def collect_package(self, controls: List[str], output_path: Path) -> str:
        """
        Create a zip package containing evidence for specified controls.
        """
        package_name = f"evidence_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_path = output_path / package_name

        with zipfile.ZipFile(zip_path, "w") as zf:
            for standard, standard_controls in self.mapping.items():
                for control_id, data in standard_controls.items():
                    if control_id in controls or "all" in controls:
                        # 1. Add control definition
                        zf.writestr(
                            f"{standard}/{control_id}/definition.json",
                            json.dumps(data, indent=2),
                        )

                        # 2. Get recent audit data for relevant dimensions
                        for dim in data["dimensions"]:
                            # Fetch recent run history for this dimension
                            history = self.persistence.get_dimension_trend(dim, days=90)
                            content = {
                                "dimension": dim,
                                "90_day_avg": sum(h["score"] for h in history)
                                / max(len(history), 1),
                                "raw_data": history,
                            }
                            zf.writestr(
                                f"{standard}/{control_id}/metrics_{dim}.json",
                                json.dumps(content, indent=2),
                            )

                        # 3. Add latest detailed report if available
                        latest_reports = self.persistence.get_audit_history(limit=1)
                        if latest_reports:
                            report_id = latest_reports[0]["id"]
                            report_file = (
                                self.root
                                / "backend"
                                / "data"
                                / "reports"
                                / f"audit_report_{report_id}.md"
                            )
                            if report_file.exists():
                                zf.write(
                                    report_file,
                                    f"{standard}/{control_id}/latest_report.md",
                                )

        return str(zip_path)
