import ast
import os
import re
import uuid
from pathlib import Path
from typing import Dict, List, Set, Tuple

from ..models import AuditFinding, DimensionScore


class ArchitectureAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.dependency_graph: Dict[str, Set[str]] = {}
        self.violations: List[Dict[str, str]] = []

    def analyze(self) -> Dict[str, any]:
        """
        Main entry point for the analyzer.
        Returns result dict compatible with AuditEngine.
        """
        print("    🔍 Scanning architecture dependencies...")
        self._build_dependency_graph()
        cycles = self._detect_circular_dependencies()
        # Check boundaries
        self._check_module_boundaries()

        # Calculate stats
        total_modules = len(self.dependency_graph)
        total_edges = sum(len(deps) for deps in self.dependency_graph.values())

        findings = []
        for cycle in cycles:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="Architecture",
                    severity="Major",
                    title="Circular Dependency Detected",
                    description=f"Cycle detected: {' -> '.join(cycle)}",
                    recommendation="Refactor modules to break the dependency cycle.",
                )
            )

        for violation in self.violations:
            findings.append(
                AuditFinding(
                    id=str(uuid.uuid4()),
                    dimension="Architecture",
                    severity="Major",
                    title="Module Boundary Violation",
                    description=violation["description"],
                    recommendation="Import only from public module exports (index.ts) or shared kernel.",
                )
            )

        cycle_count = len(cycles)
        boundary_violations = len(self.violations)

        # update score calculation to include boundary violations
        score_val = self._calculate_score(cycle_count + boundary_violations)

        score = DimensionScore(
            dimension="Architecture",
            score=score_val,
            findings_count=len(findings),
            details={
                "cycle_count": cycle_count,
                "boundary_violations": boundary_violations,
                "modules_scanned": total_modules,
                "dependency_edges": total_edges,
            },
        )

        return {"findings": findings, "score": score}

    def _calculate_score(self, cycle_count: int) -> float:
        if cycle_count == 0:
            return 5.0
        elif cycle_count < 3:
            return 4.0
        elif cycle_count < 6:
            return 3.0
        elif cycle_count < 10:
            return 2.0
        else:
            return 1.0

    def _build_dependency_graph(self):
        """
        Scans all .py and .ts/.tsx files to build an import graph.
        """
        for root, _, files in os.walk(self.project_root):
            if (
                "node_modules" in root
                or "venv" in root
                or ".git" in root
                or "__pycache__" in root
            ):
                continue

            for file in files:
                file_path = Path(root) / file
                if file.endswith(".py"):
                    self._parse_python_imports(file_path)
                elif file.endswith(".ts") or file.endswith(".tsx"):
                    self._parse_typescript_imports(file_path)

    def _parse_python_imports(self, file_path: Path):
        try:
            rel_path = str(file_path.relative_to(self.project_root)).replace("\\", "/")
            if rel_path not in self.dependency_graph:
                self.dependency_graph[rel_path] = set()

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        self.dependency_graph[rel_path].add(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        self.dependency_graph[rel_path].add(node.module)
        except Exception:
            # Skip files that fail to parse (e.g. syntax errors)
            pass

    def _parse_typescript_imports(self, file_path: Path):
        try:
            rel_path = str(file_path.relative_to(self.project_root)).replace("\\", "/")
            if rel_path not in self.dependency_graph:
                self.dependency_graph[rel_path] = set()

            import_pattern = re.compile(r'import\s+.*?from\s+[\'"](.*?)[\'"]')

            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            for line in lines:
                match = import_pattern.search(line)
                if match:
                    import_target = match.group(1)
                    # Normalize simple relative imports for the graph
                    # This is a basic approximation
                    if import_target.startswith("."):
                        # Resolve relative path to absolute-ish conceptual path if possible
                        # For now, just store the raw target to detect direct cycles in same dir
                        pass
                    self.dependency_graph[rel_path].add(import_target)
        except Exception:
            pass

    def _detect_circular_dependencies(self) -> List[List[str]]:
        """
        Standard DFS cycle detection.
        Returns a list of cycles found (each cycle is a list of node names).
        """
        visited = set()
        recursion_stack = set()
        cycles = []

        def dfs(node, path):
            visited.add(node)
            recursion_stack.add(node)
            path.append(node)

            if node in self.dependency_graph:
                for neighbor in self.dependency_graph[node]:
                    # Heuristic mapping: try to match imports to file paths
                    # This is tricky without a full resolver.
                    # For a V1, we might only check exact string matches if we fully resolved them.
                    # Or simpler: Just check if we've seen this 'neighbor' as a file key?
                    # Python imports 'backend.x' map to 'backend/x.py'.
                    # Let's try a simple heuristic resolution for Python.
                    resolved_neighbor = neighbor.replace(".", "/") + ".py"

                    if resolved_neighbor not in self.dependency_graph:
                        # Try with .ts
                        resolved_neighbor = neighbor

                    # If we can't resolve it to a node in our graph, skip it (external lib)
                    target_node = None
                    for key in self.dependency_graph:
                        if key.endswith(resolved_neighbor):
                            target_node = key
                            break

                    if target_node:
                        if target_node not in visited:
                            dfs(target_node, path)
                        elif target_node in recursion_stack:
                            # Cycle detected
                            cycle_start_index = path.index(target_node)
                            cycles.append(path[cycle_start_index:].copy())

            recursion_stack.remove(node)
            path.pop()

        # Limit DFS to avoid infinite recursion on massive graphs or weird edges
        # Just run on a subset or with limit if needed. For now standard DFS.
        for node in list(self.dependency_graph.keys()):
            if node not in visited:
                dfs(node, [])

        return cycles

    def _check_module_boundaries(self):
        """
        Enforce clean architecture:
        - Modules should not import from other modules' internals (e.g. modules/A importing modules/B/components/Internal.tsx)
        - Modules should only import from 'shared', 'services', or other modules' top-level index.
        """
        for source, deps in self.dependency_graph.items():
            if "modules/" not in source:
                continue

            # extract module name, e.g. "modules/audit/..." -> "audit"
            try:
                source_module = source.split("modules/")[1].split("/")[0]
            except IndexError:
                continue

            for target in deps:
                if "modules/" not in target:
                    continue

                try:
                    target_module = target.split("modules/")[1].split("/")[0]
                except IndexError:
                    continue

                # Allow self-imports
                if source_module == target_module:
                    continue

                # Violation: Importing deep into another module
                # Allowed: import { X } from 'modules/other' (if aliases used) or '../other'
                # Disallowed: 'modules/other/components/Deep.tsx'

                # Normalized path check
                if (
                    "/components/" in target
                    or "/utils/" in target
                    or "/hooks/" in target
                ):
                    self.violations.append(
                        {
                            "source": source,
                            "target": target,
                            "description": f"Module '{source_module}' imports private internal '{target}' from '{target_module}'. Use public exports.",
                        }
                    )
