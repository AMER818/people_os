import os
import sys

from backend.audit.analyzers.ui_ux import UIUXAnalyzer

# Ensure backend can be imported
sys.path.append(os.getcwd())


def verify_ui_ux():
    print("--- Running UI/UX & Theme Verification ---")
    analyzer = UIUXAnalyzer()

    try:
        result = analyzer.analyze()
        score = result["score"]
        findings = result["findings"]

        print(f"\n📊 UI/UX Score: {score.score}/5.0")
        print("\n📈 Metrics:")
        for key, value in score.details.items():
            if key != "accessibility_files":
                print(f"  - {key}: {value}")

        if "accessibility_files" in score.details:
            print(
                f"\n♿ Files with Accessibility Violations ({len(score.details['accessibility_files'])}):"
            )
            for file_path in score.details["accessibility_files"]:
                print(f"  - {file_path}")

        print(f"\n🚩 Findings ({len(findings)}):")
        if not findings:
            print("  ✅ No violations found!")
        else:
            for f in findings:
                print(f"  - [{f.severity}] {f.title}")
                print(f"    Description: {f.description}")
                print(f"    Recommendation: {f.recommendation}")
                if hasattr(f, "file"):
                    print(f"    File: {f.file}")
                elif isinstance(f, dict) and "file" in f:
                    print(f"    File: {f['file']}")
                print("")

        # Interpretation of "Centralized"
        # We check if hardcoded values are low.
        print("\n--- Compliance Analysis ---")
        if score.details["hardcoded_colors"] == 0:
            print("✅ Theme Colors: 100% Centralized (No hardcoded colors)")
        else:
            print(
                f"⚠️ Theme Colors: {score.details['hardcoded_colors']} violations (Hardcoded colors detected)"
            )

        if score.details["hardcoded_spacing"] == 0:
            print("✅ Layout Spacing: 100% Centralized (No hardcoded pixels)")
        else:
            print(
                f"⚠️ Layout Spacing: {score.details['hardcoded_spacing']} violations (Hardcoded spacing detected)"
            )

    except Exception as e:
        print(f"❌ Verification Failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    verify_ui_ux()
