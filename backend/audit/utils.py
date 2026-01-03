"""
Audit Engine Utils
Shared utility functions for audit execution.
"""

import json
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def run_command_safe(command: List[str], cwd: str = ".") -> Tuple[bool, str, str]:
    """
    Execute shell command safely with timeout.

    Returns:
        (success, stdout, stderr)
    """
    try:
        result = subprocess.run(
            command, cwd=cwd, capture_output=True, text=True, timeout=300  # 5 min max
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)


def parse_eslint_output(output: str) -> List[Dict]:
    """Parse ESLint JSON output into findings"""
    findings = []
    try:
        data = json.loads(output)
        for file_result in data:
            for message in file_result.get("messages", []):
                findings.append(
                    {
                        "file": file_result.get("filePath", ""),
                        "line": message.get("line", 0),
                        "column": message.get("column", 0),
                        "severity": (
                            "Major" if message.get("severity") == 2 else "Minor"
                        ),
                        "message": message.get("message", ""),
                        "rule": message.get("ruleId", ""),
                    }
                )
    except json.JSONDecodeError:
        pass
    return findings


def calculate_score(metrics: Dict) -> float:
    """
    Calculate standardized score (0-5) from metrics.

    Higher is better:
    - 5.0 = Excellent
    - 4.0 = Good
    - 3.0 = Acceptable
    - 2.0 = Needs improvement
    - 1.0 = Poor
    - 0.0 = Critical
    """
    # Weighted scoring based on metrics
    total_weight = 0
    total_score = 0

    for key, value in metrics.items():
        if isinstance(value, (int, float)):
            weight = 1.0
            if "critical" in key.lower():
                weight = 3.0
            elif "major" in key.lower():
                weight = 2.0

            # Invert if it's an error count (fewer is better)
            if "error" in key.lower() or "violation" in key.lower():
                score = max(0, 5 - (value / 10))  # 10 errors = 0 score
            else:
                score = min(5, value)

            total_score += score * weight
            total_weight += weight

    return round(total_score / total_weight, 1) if total_weight > 0 else 3.0


def classify_severity(score: float, error_count: int) -> str:
    """Classify finding severity"""
    if score < 2.0 or error_count > 20:
        return "Critical"
    elif score < 3.0 or error_count > 10:
        return "Major"
    else:
        return "Minor"


def get_project_root() -> Path:
    """Get absolute path to project root"""
    return Path(__file__).parent.parent.parent


def count_files_by_extension(directory: Path, extensions: List[str]) -> int:
    """Count files with given extensions"""
    count = 0
    for ext in extensions:
        count += len(list(directory.rglob(f"*{ext}")))
    return count
