from pathlib import Path

modules = [
    "admin", "analytics", "assets", "audit",
    "employee", "expenses", "org-profile",
    "payroll", "recruitment"
]

docs_dir = Path("docs/architecture")
docs_dir.mkdir(parents=True, exist_ok=True)

template = """# ADR-{index:03d}: {name} Module

## Status
Accepted

## Context
The {name} module handles core functionality for {name} management.

## Decision
We implemented a modular structure for {name} using React and FastAPI.

## Consequences
- Better separation of concerns
- Scalable development
"""

for i, mod in enumerate(modules, start=1):
    # normalize name
    name = mod.replace("-", " ").title()
    filename = docs_dir / f"ADR-{i:03d}-{mod.capitalize()}.md"
    filename.write_text(template.format(index=i, name=name), encoding="utf-8")
    print(f"Created {filename}")
