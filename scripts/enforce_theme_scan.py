#!/usr/bin/env python3
"""Simple scanner to detect hard-coded colors and Tailwind color utilities.

Usage:
  python scripts/enforce_theme_scan.py --path src --fail-on-match

Exempt files/dirs under --whitelist (comma-separated) default: src/design-system,index.css,src/theme
"""
import argparse
import os
import re
import json
from pathlib import Path

HEX_RE = re.compile(r"#[0-9a-fA-F]{3,6}")
RGBA_RE = re.compile(r"rgba?\(")
TAILWIND_COLOR_RE = re.compile(r"\b(bg|text|hover:bg|hover:text)-(?:blue|emerald|rose|purple|indigo|yellow|red|orange|green|pink|violet|cyan|sky|slate|purple)-[0-9]{3}\b")

DEFAULT_WHITELIST = ["src/design-system", "index.css", "src/theme", "tailwind.config.cjs"]

EXTS = {".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".html"}


def scan_file(path, whitelist_dirs):
    matches = []
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        return matches
    for i, line in enumerate(text.splitlines(), start=1):
        if HEX_RE.search(line) or RGBA_RE.search(line) or TAILWIND_COLOR_RE.search(line):
            # Skip if file path is explicitly whitelisted
            pstr = str(path).replace('\\', '/')
            if any(w in pstr for w in whitelist_dirs):
                continue
            hits = []
            for r in (HEX_RE, RGBA_RE, TAILWIND_COLOR_RE):
                for m in r.finditer(line):
                    hits.append(m.group(0))
            if hits:
                matches.append({"line": i, "text": line.strip(), "matches": hits})
    return matches


def walk_and_scan(root, whitelist_dirs):
    results = {}
    root = Path(root)
    for path in root.rglob('*'):
        if path.is_file() and path.suffix in EXTS:
            pstr = str(path).replace('\\', '/')
            if any(w in pstr for w in whitelist_dirs):
                continue
            m = scan_file(path, whitelist_dirs)
            if m:
                results[pstr] = m
    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--path', default='src', help='Root path to scan')
    ap.add_argument('--whitelist', default=','.join(DEFAULT_WHITELIST), help='Comma-separated whitelist substrings')
    ap.add_argument('--fail-on-match', action='store_true', help='Exit with non-zero on any match')
    ap.add_argument('--report-file', help='Write JSON report to this file')
    args = ap.parse_args()

    whitelist_dirs = [w.strip() for w in args.whitelist.split(',') if w.strip()]
    if not os.path.exists(args.path):
        print(f"Path not found: {args.path}")
        raise SystemExit(2)

    results = walk_and_scan(args.path, whitelist_dirs)
    total = sum(len(v) for v in results.values())
    if total == 0:
        print(f"No hard-coded color or Tailwind utility matches found under {args.path} (whitelist: {whitelist_dirs}).")
    else:
        print(f"Found {total} match(es) in {len(results)} file(s):")
        for f, hits in sorted(results.items()):
            print(f"\n{f}:")
            for h in hits:
                print(f"  L{h['line']}: {h['matches']} -- {h['text']}")
    if args.report_file:
        with open(args.report_file, 'w', encoding='utf-8') as fh:
            json.dump(results, fh, indent=2)
        print(f"Wrote report to {args.report_file}")

    if total and args.fail_on_match:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
