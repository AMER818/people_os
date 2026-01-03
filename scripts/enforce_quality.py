import sys
import os
from pathlib import Path

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.audit.analyzers.ui_ux import UIUXAnalyzer
from backend.audit.utils import get_project_root


def check_missing_imports(root_dir):
    print("🔎 Scanning for missing PALETTE imports...")
    issues = []
    # Directories to skip
    skip_dirs = {"node_modules", ".git", "dist", "build", ".venv", "__pycache__"}

    for root, dirs, files in os.walk(root_dir):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in skip_dirs]

        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Check for PALETTE usage without import
                    if "PALETTE" in content:
                        is_imported = (
                            "import { PALETTE }" in content
                            or "import {PALETTE}" in content
                            or "export const PALETTE" in content
                        )
                        if not is_imported:
                            # Verify checking lines (avoid comments)
                            lines = content.split("\n")
                            usage_found = False
                            for line in lines:
                                stripped = line.strip()
                                if (
                                    "PALETTE" in line
                                    and not stripped.startswith("//")
                                    and not stripped.startswith("import")
                                    and not stripped.startswith("*")
                                ):
                                    usage_found = True
                                    break

                            if usage_found:
                                issues.append(path)
                except Exception as e:
                    print(f"⚠️ Error reading {path}: {e}")
    return issues


def main():
    print("\n🛡️  STARTING STRICT QUALITY COMPLIANCE CHECK 🛡️\n")

    violations_found = False

    # 1. Run UI/UX Analyzer
    print("🎨 Running UI/UX Analyzer (Colors & Spacing)...")
    analyzer = UIUXAnalyzer()
    results = analyzer.analyze()

    metrics = results.get("metrics", {})
    hardcoded_colors = metrics.get("hardcoded_colors", 0)
    hardcoded_spacing = metrics.get("hardcoded_spacing", 0)

    if hardcoded_colors > 0:
        print(f"❌ VIOLATION: Found {hardcoded_colors} hardcoded colors!")
        violations_found = True

    if hardcoded_spacing > 0:
        print(f"❌ VIOLATION: Found {hardcoded_spacing} hardcoded spacing values!")
        violations_found = True

    if not violations_found:
        print("✅ UI/UX Compliance: PASS")

    # 2. Check Missing Imports
    project_root = get_project_root()
    missing_imports = check_missing_imports(project_root)

    if missing_imports:
        print(
            f"❌ VIOLATION: Found {len(missing_imports)} files with missing PALETTE imports!"
        )
        for f in missing_imports:
            print(f"   - {f}")
        violations_found = True
    else:
        print("✅ Import Compliance: PASS")

    print("\n" + "=" * 40)
    if violations_found:
        print("⛔ QUALITY CHECK FAILED! FIX VIOLATIONS IMMEDIATELY.")
        print("=" * 40 + "\n")
        sys.exit(1)
    else:
        print("✨ ALL SYSTEMS GO! QUALITY CHECK PASSED.")
        print("=" * 40 + "\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
