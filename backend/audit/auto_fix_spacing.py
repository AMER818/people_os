import os
import re
from pathlib import Path


def clean_rem(value):
    rem_val = float(value) / 16
    if rem_val.is_integer():
        return f"{int(rem_val)}rem"
    return f"{rem_val:.4f}".rstrip("0") + "rem"


def replace_px(match):
    px_val = match.group(1)
    return clean_rem(px_val)


def process_file(filepath):
    try:
        content = Path(filepath).read_text(encoding="utf-8")
        # Regex to find `\d+px` but avoid `1px solid` if we want?
        # Actually `1px solid` -> `0.0625rem solid` is valid.
        # But `border-[1px]` -> `border-[0.0625rem]` is also valid.
        # We replace any sequence of digits followed by px.
        new_content = re.sub(r"(\d+)px", replace_px, content)
        if new_content != content:
            Path(filepath).write_text(new_content, encoding="utf-8")
            print(f"Fixed {filepath}")
        else:
            # print(f"No changes in {filepath}")
            pass
    except Exception as e:
        print(f"Error processing {filepath}: {e}")


def main():
    root = Path(os.getcwd())
    modules_dir = root / "modules"

    if not modules_dir.exists():
        print("Modules directory not found")
        return

    print("Scanning for px values in modules and components...")
    files = list(modules_dir.rglob("*.tsx"))

    components_dir = root / "components"
    if components_dir.exists():
        files.extend(list(components_dir.rglob("*.tsx")))

    print(f"Found {len(files)} files.")

    for f in files:
        process_file(f)

    print("Done.")


if __name__ == "__main__":
    main()
