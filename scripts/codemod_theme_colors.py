#!/usr/bin/env python3
"""Codemod to replace hard-coded Tailwind color classes with theme tokens.

Safe replacements (1:1 mapping):
- bg-blue-600 → bg-primary
- hover:bg-blue-600 → hover:bg-primary-hover
- bg-emerald-500 → bg-success
- text-white → text-white (kept as-is, neutral utility)
- text-slate-* → text-text-secondary / text-text-muted (contextual)

Usage:
  python scripts/codemod_theme_colors.py --file src/App.tsx --dry-run
  python scripts/codemod_theme_colors.py --file src/App.tsx --apply
  python scripts/codemod_theme_colors.py --glob "modules/**/*.tsx" --apply
"""
import argparse
import re
from pathlib import Path
import json

# Safe 1:1 replacements
REPLACEMENTS = {
    # Primary (blue-600)
    r'\bbg-blue-600\b': 'bg-primary',
    r'\bhover:bg-blue-600\b': 'hover:bg-primary-hover',
    r'\btext-blue-600\b': 'text-primary',  # rare but safe
    r'\btext-blue-500\b': 'text-info',  # info-level accent
    r'\btext-blue-400\b': 'text-info',  # lighter blue → info
    r'\bbg-blue-500/10\b': 'bg-info/10',
    r'\bborder-blue-500/20\b': 'border-info/20',
    r'\bshadow-blue-500\b': 'shadow-info',  # charts & glows
    r'\bshadow-blue-600\b': 'shadow-primary',
    
    # Success (emerald-500)
    r'\bbg-emerald-500\b': 'bg-success',
    r'\bhover:bg-emerald-500\b': 'hover:bg-success-hover',
    r'\bhover:bg-emerald-600\b': 'hover:bg-success',
    r'\bbg-emerald-500/10\b': 'bg-success/10',
    r'\bbg-emerald-500/5\b': 'bg-success/5',
    r'\btext-emerald-500\b': 'text-success',
    r'\btext-emerald-400\b': 'text-success',
    r'\bborder-emerald-500\b': 'border-success',
    r'\bborder-emerald-500/20\b': 'border-success/20',
    r'\bshadow-emerald-500\b': 'shadow-success',
    r'\bshadow-emerald-500/10\b': 'shadow-success/10',
    
    # Indigo (indigo-600)
    r'\bbg-indigo-600\b': 'bg-primary-soft',  # softer primary
    r'\bhover:bg-indigo-600\b': 'hover:bg-primary',
    r'\btext-indigo-600\b': 'text-primary-soft',
    r'\btext-indigo-500\b': 'text-primary-soft',
    r'\bbg-indigo-500/10\b': 'bg-primary/10',
    r'\bborder-indigo-600\b': 'border-primary',
    r'\bshadow-indigo-600\b': 'shadow-primary',
    
    # Red/Rose (danger)
    r'\bbg-rose-600\b': 'bg-danger',
    r'\bhover:bg-rose-600\b': 'hover:bg-danger',
    r'\btext-rose-500\b': 'text-danger',
    r'\btext-rose-600\b': 'text-danger',
    r'\bbg-rose-500/10\b': 'bg-danger/10',
    r'\bborder-rose-500\b': 'border-danger',
    r'\bborder-rose-500/20\b': 'border-danger/20',
    r'\bbg-red-500\b': 'bg-danger',
    r'\btext-red-500\b': 'text-danger',
    
    # Orange/Amber (warning)
    r'\bbg-orange-500\b': 'bg-warning',
    r'\bhover:bg-orange-600\b': 'hover:bg-warning',
    r'\btext-orange-500\b': 'text-warning',
    r'\btext-orange-400\b': 'text-warning',
    r'\bbg-orange-500/10\b': 'bg-warning/10',
    r'\bborder-orange-500\b': 'border-warning',
    r'\bborder-orange-500/20\b': 'border-warning/20',
}

def codemod_file(path, dry_run=True, verbose=True):
    """Apply codemod replacements to a single file."""
    try:
        content = path.read_text(encoding='utf-8')
    except Exception as e:
        if verbose:
            print(f"  Error reading {path}: {e}")
        return {"file": str(path), "matched": 0, "error": str(e)}
    
    original = content
    changes = 0
    for pattern, replacement in REPLACEMENTS.items():
        content, count = re.subn(pattern, replacement, content)
        changes += count
    
    result = {"file": str(path), "matched": changes}
    if changes and not dry_run:
        try:
            path.write_text(content, encoding='utf-8')
            result["applied"] = True
            if verbose:
                print(f"  ✓ {path.name}: {changes} changes applied")
        except Exception as e:
            result["error"] = str(e)
            if verbose:
                print(f"  ✗ {path.name}: {e}")
    elif changes and dry_run and verbose:
        print(f"  [DRY RUN] {path.name}: {changes} changes would be applied")
    
    return result

def main():
    ap = argparse.ArgumentParser(description="Codemod for theme color replacements")
    ap.add_argument('--file', help='Single file to process')
    ap.add_argument('--glob', help='Glob pattern to match files (e.g., "modules/**/*.tsx")')
    ap.add_argument('--path', default='.', help='Root path to scan (used with --glob)')
    ap.add_argument('--dry-run', action='store_true', default=True, help='Show changes without applying (default)')
    ap.add_argument('--apply', action='store_true', help='Actually apply changes')
    ap.add_argument('--report-file', help='Write JSON report to this file')
    args = ap.parse_args()
    
    if args.apply:
        args.dry_run = False
    
    files = []
    if args.file:
        files = [Path(args.file)]
    elif args.glob:
        root = Path(args.path)
        files = list(root.glob(args.glob))
    else:
        ap.print_help()
        return
    
    results = []
    for f in sorted(files):
        if f.is_file() and f.suffix in {'.ts', '.tsx', '.js', '.jsx'}:
            result = codemod_file(f, dry_run=args.dry_run, verbose=True)
            results.append(result)
    
    total_matched = sum(r.get('matched', 0) for r in results)
    print(f"\n{len(results)} file(s) scanned, {total_matched} total matches")
    
    if args.report_file:
        with open(args.report_file, 'w', encoding='utf-8') as fh:
            json.dump(results, fh, indent=2)
        print(f"Report written to {args.report_file}")
    
    if args.dry_run and total_matched:
        print("\nRun with --apply to apply changes")

if __name__ == '__main__':
    main()
