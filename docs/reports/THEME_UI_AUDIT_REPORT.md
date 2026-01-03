# Theme & UI Audit Report

Date: 2026-01-07

Summary
- Root: project uses centralized CSS variables and a JS `PALETTE`, but many components still use hard-coded Tailwind color utilities and hex/rgb literals. This breaks theme portability and prevents full theme compliance.

Key Files/Assets
- Tailwind mapping: [tailwind.config.cjs](tailwind.config.cjs)
- Central CSS variables: [index.css](index.css) and [src/design-system/theme.css](src/design-system/theme.css)
- JS palette: [src/theme/palette.ts](src/theme/palette.ts)
- Examples of offender files: [modules/OrgSetup.tsx](modules/OrgSetup.tsx), [modules/recruitment/RecruitmentBoard.tsx](modules/recruitment/RecruitmentBoard.tsx), [modules/Dashboard.tsx](modules/Dashboard.tsx)

Findings (summary)
- Pattern A — Tailwind color utilities used directly: `bg-blue-600`, `text-white`, `bg-emerald-500`, etc. These appear across many modules and UI components.
- Pattern B — Hex/RGBA literals in CSS or inline styles (e.g., `#3B82F6`, `rgba(...)`) often inside shadows, gradients, or inline style objects.
- Pattern C — Component-level mappings (conditional classnames) that choose Tailwind colors dynamically (e.g., `bg-${s.color}-500`). These are higher-risk to codemod safely.

Impact
- Theme switching and palette customization are partial — many UI elements will not adapt when theme variables change.
- Analytics/charts use `PALETTE` but UI buttons/cards often do not — inconsistent user experience.

Prioritized Remediation Plan

1) Critical (High) — Prevent regressions and enable CI detection
- Add an automated scanner (CI) that fails when color hex literals or Tailwind color utilities are introduced outside of the design-system or theme token files.
- Suggested location: `scripts/enforce_theme_scan.py` (or `scripts/enforce-theme-check.js`).
- Minimal scanner rules:
  - Regex for hex/rgb: `#[0-9a-fA-F]{3,6}` and `rgba?\(`
  - Regex for Tailwind color classes: `\bbg-(?:blue|emerald|rose|purple|indigo|yellow|red|orange|green|pink|violet|cyan|sky)-[0-9]{3}\b|\btext-(?:blue|emerald|...)` (tune to project list)
  - Exemptions: files in `src/design-system`, `index.css`, `src/theme`, and any explicitly whitelisted folders.

2) Recommended (Medium) — High-impact conversions
- Build a codemod script to safely replace common button/card classes to theme tokens. Examples:
  - `bg-blue-600 text-white` -> `bg-primary text-white` (or `bg-[var(--primary)]` depending on class mapping)
  - `bg-primary-hover` / `hover:bg-primary-hover` for hover states.
- For dynamic `bg-${color}-500` patterns, flag for manual review (codemod can detect but should not auto-replace unless mapping exists).

3) Recommended (Medium) — Apply fixes to top offenders
- Identify the top ~20 files by matches (modules with repeated direct color usage). Create a PR converting them to theme tokens and `PALETTE` usage for charts. Start with: [modules/OrgSetup.tsx](modules/OrgSetup.tsx), [modules/recruitment/RecruitmentBoard.tsx](modules/recruitment/RecruitmentBoard.tsx), [modules/Dashboard.tsx](modules/Dashboard.tsx), [modules/SystemSettings.tsx](modules/SystemSettings.tsx).

4) Optional (Low) — Lint rule and commit hook
- Add an ESLint rule or pre-commit hook that runs the scanner before commits.

Implementation Notes & Examples
- Scanner CLI example (pseudo):

```bash
python scripts/enforce_theme_scan.py --path src --fail-on-match
```

- Codemod approach:
  - Use `jscodeshift` or a small Node script to replace static `className` strings.
  - Replace only when the className is a literal string and maps 1:1 to a token.

Sample safe replacements (manual/codemod):
- `bg-blue-600` → `bg-primary`
- `hover:bg-blue-600` → `hover:bg-primary-hover`
- `bg-emerald-500` → `bg-success`

Risks & Manual Review Areas
- Gradient backgrounds, multi-stop shadows, and dynamic class generation must be reviewed manually.
- Charts and visualization code using `PALETTE` are already fine; ensure palette values are kept in sync with `--primary` CSS variables if needed.

Next Steps (pick one):
- A) I implement the automated scanner script (`scripts/enforce_theme_scan.py`) and add a CI job entry — quick, blocks new violations.
- B) I implement the codemod for straightforward replacements and run it against a small set (top 20) and open a PR for review.
- C) I generate a prioritized patch set (manual edits) for the top offenders and open a PR.

I can start with A and B together (scanner + codemod), then open a PR with the audit and automated tools. Confirm which you'd like me to do next.
