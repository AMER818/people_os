"""
AST Analysis Utilities for AI Safety Audit
Provides Abstract Syntax Tree parsing for Python and TypeScript/JavaScript files.
"""

import ast
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class AICall:
    """Represents a single AI SDK call with extracted parameters"""

    file_path: str
    function_name: str
    line_number: int
    model: Optional[str] = None
    temperature: Optional[float] = None
    has_grounding: bool = False
    has_validation: bool = False
    has_error_handling: bool = False
    has_rate_limiting: bool = False
    has_pii_redaction: bool = False
    prompt_text: Optional[str] = None


class ParentNodeVisitor(ast.NodeVisitor):
    """Adds parent references to all nodes in the AST"""

    def __init__(self):
        self.parents = {}

    def visit(self, node):
        for child in ast.iter_child_nodes(node):
            self.parents[child] = node
            self.visit(child)


class PythonASTAnalyzer:
    """Analyzes Python files using AST parsing"""

    AI_SDK_PATTERNS = [
        "openai",
        "anthropic",
        "gemini",
        "ChatCompletion",
        # "Completion",  # Too generic
        # "create",     # Too generic, causes false positives in React/Factories
    ]

    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.source = file_path.read_text(encoding="utf-8")
        try:
            self.tree = ast.parse(self.source)
            self._add_parent_pointers()
        except SyntaxError:
            self.tree = None
            self.parents = {}

    def _add_parent_pointers(self):
        """Add parent pointers to all nodes"""
        visitor = ParentNodeVisitor()
        visitor.visit(self.tree)
        self.parents = visitor.parents

    def extract_ai_calls(self) -> List[AICall]:
        """Extract all AI SDK calls from the AST"""
        if not self.tree:
            return []

        calls = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Call):
                ai_call = self._analyze_call_node(node)
                if ai_call:
                    calls.append(ai_call)

        return calls

    def _analyze_call_node(self, node: ast.Call) -> Optional[AICall]:
        """Analyze a call node to determine if it's an AI SDK call"""
        # Check if the call matches AI SDK patterns
        func_name = self._get_function_name(node.func)
        if not any(pattern in func_name for pattern in self.AI_SDK_PATTERNS):
            return None

        # Extract parameters
        temperature = self._extract_temperature(node)
        model = self._extract_model(node)
        has_grounding = self._check_grounding(node)

        # Get line number
        line_number = node.lineno if hasattr(node, "lineno") else 0

        # Check if call is in try-except block
        has_error_handling = self._is_in_try_block(node)

        return AICall(
            file_path=str(self.file_path),
            function_name=func_name,
            line_number=line_number,
            model=model,
            temperature=temperature,
            has_grounding=has_grounding,
            has_validation=False,  # Will be checked in context
            has_error_handling=has_error_handling,
        )

    def _get_function_name(self, node: ast.AST) -> str:
        """Extract function name from call node"""
        if isinstance(node, ast.Attribute):
            return f"{self._get_function_name(node.value)}.{node.attr}"
        elif isinstance(node, ast.Name):
            return node.id
        return ""

    def _extract_temperature(self, node: ast.Call) -> Optional[float]:
        """Extract temperature parameter from call"""
        for keyword in node.keywords:
            if keyword.arg == "temperature":
                if isinstance(keyword.value, ast.Constant):
                    return float(keyword.value.value)
        return None

    def _extract_model(self, node: ast.Call) -> Optional[str]:
        """Extract model parameter from call"""
        for keyword in node.keywords:
            if keyword.arg == "model":
                if isinstance(keyword.value, ast.Constant):
                    return str(keyword.value.value)
        return None

    def _check_grounding(self, node: ast.Call) -> bool:
        """Check if the call includes grounding instructions in messages"""
        for keyword in node.keywords:
            if keyword.arg == "messages" and isinstance(keyword.value, ast.List):
                # Check messages list for grounding keywords
                for msg in keyword.value.elts:
                    if isinstance(msg, ast.Dict):
                        for key, value in zip(msg.keys, msg.values):
                            if isinstance(value, ast.Constant):
                                text = str(value.value).lower()
                                if any(
                                    kw in text
                                    for kw in [
                                        "only use provided",
                                        "context",
                                        "grounding",
                                        "based on",
                                    ]
                                ):
                                    return True
        return False

    def _is_in_try_block(self, node: ast.AST) -> bool:
        """Check if node is within a try-except block using parent pointers"""
        curr = node
        while curr in self.parents:
            curr = self.parents[curr]
            if isinstance(curr, ast.Try):
                return True
        return False

    def check_security_patterns(self) -> Dict[str, bool]:
        """Check for security-related patterns in the file"""
        patterns = {
            "has_input_sanitization": bool(
                re.search(
                    r"(sanitize|escape|clean).*(input|prompt)",
                    self.source,
                    re.IGNORECASE,
                )
            ),
            "has_pii_redaction": bool(
                re.search(
                    r"(redact|anonymize|mask).*(pii|sensitive)",
                    self.source,
                    re.IGNORECASE,
                )
            ),
            "has_rate_limiting": bool(
                re.search(r"@(rate_limit|throttle|limiter)", self.source)
            ),
            "imports_security_lib": bool(
                re.search(r"import.*(presidio|scrubadub|slowapi)", self.source)
            ),
        }
        return patterns


class TypeScriptASTAnalyzer:
    """Analyzes TypeScript/JavaScript files using esprima"""

    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.source = file_path.read_text(encoding="utf-8")
        self.ast = None
        try:
            import esprima

            try:
                self.ast = esprima.parseModule(self.source, {"loc": True})
            except Exception:
                self.ast = esprima.parseScript(self.source, {"loc": True})

            # Convert to dict for easier traversal
            if hasattr(self.ast, "toDict"):
                self.ast = self.ast.toDict()

        except ImportError:
            # Fallback to regex if esprima not available
            pass
        except Exception:
            # Parse errors - fallback to regex
            pass

    def extract_ai_calls(self) -> List[AICall]:
        """Extract AI calls from TypeScript/JavaScript"""
        if not self.ast:
            return self._fallback_regex_extraction()

        self.calls = []
        self._traverse(self.ast, in_try=False)
        return self.calls

    def _traverse(self, node: Any, in_try: bool = False):
        """Recursively traverse the Esprima AST"""
        if isinstance(node, dict):
            # Check if entering a try block
            current_in_try = in_try
            if node.get("type") == "TryStatement":
                current_in_try = True

            if node.get("type") == "CallExpression":
                ai_call = self._analyze_call_node(node, current_in_try)
                if ai_call:
                    self.calls.append(ai_call)

            for key, value in node.items():
                self._traverse(value, current_in_try)
        elif isinstance(node, list):
            for item in node:
                self._traverse(item, in_try)

    def _analyze_call_node(self, node: Dict[str, Any], in_try: bool) -> Optional[AICall]:
        """Analyze a CallExpression node"""
        callee = node.get("callee")
        if not callee:
            return None

        func_name = self._get_function_name(callee)
        if not any(
            pattern in func_name
            for pattern in ["openai", "anthropic", "gemini", "create", "completion", "generateContent"]
        ):
            return None

        # Extract arguments
        args = node.get("arguments", [])
        params = self._extract_params(args)
        
        # Check grounding in params/args
        has_grounding = self._check_grounding_in_args(args)
        
        # DEBUG: Print status
        status = "✅" if has_grounding else "❌"
        print(f"  AST Call: {func_name} (Line {node.get('loc', {}).get('start', {}).get('line', 0)}) - Grounding: {status} - InTry: {in_try}")

        return AICall(
            file_path=str(self.file_path),
            function_name=func_name,
            line_number=node.get("loc", {}).get("start", {}).get("line", 0),
            model=params.get("model"),
            temperature=params.get("temperature"),
            has_grounding=has_grounding,
            has_validation=False,
            has_error_handling=in_try,
            has_rate_limiting=False,
            has_pii_redaction=False,
        )

    def _check_grounding_in_args(self, args: List[Any]) -> bool:
        """Recursively search arguments for grounding keywords"""
        serialized = str(args).lower()
        keywords = ["only use provided", "context", "grounding", "based on", "system:", "context:"]
        return any(kw in serialized for kw in keywords)

    def _get_function_name(self, node: Dict[str, Any]) -> str:
        """Get function name from MemberExpression or Identifier"""
        if node.get("type") == "MemberExpression":
            obj = self._get_function_name(node.get("object", {}))
            prop = node.get("property", {}).get("name", "")
            return f"{obj}.{prop}"
        elif node.get("type") == "Identifier":
            return node.get("name", "")
        return ""

    def _extract_params(self, args: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract parameters from call arguments"""
        params = {}
        if not args:
            return params

        # Usually configuration is the first or second argument object
        for arg in args:
            if arg.get("type") == "ObjectExpression":
                for prop in arg.get("properties", []):
                    key = prop.get("key", {}).get("name")
                    val = prop.get("value", {})

                    if key == "model":
                        params["model"] = self._extract_literal_value(val)
                    elif key == "temperature":
                        params["temperature"] = self._extract_literal_value(val)
        return params

    def _extract_literal_value(self, node: Dict[str, Any]) -> Any:
        """Extract value from Literal node"""
        if node.get("type") == "Literal":
            return node.get("value")
        return None

    def _fallback_regex_extraction(self) -> List[AICall]:
        """Fallback to regex-based extraction"""
        # Basic regex fallback for when AST parsing fails
        return []


class CallGraphAnalyzer(ast.NodeVisitor):
    """
    Performs simple data flow analysis to track user input to AI calls.
    Tracks variables assigned from 'sources' and checks if they reach 'sinks'.
    """

    SOURCES = ["input", "request", "stdin", "sys.argv"]

    def __init__(self, tree: ast.AST):
        self.tree = tree
        self.tainted_vars = set()
        self.detected_flows = []
        self.current_function = None

    def analyze(self) -> List[Dict[str, Any]]:
        self.visit(self.tree)
        return self.detected_flows

    def visit_FunctionDef(self, node):
        self.current_function = node.name
        # Treat arguments as potential sources (conservative)
        for arg in node.args.args:
            self.tainted_vars.add(arg.arg)
        self.generic_visit(node)
        self.current_function = None

    def visit_Assign(self, node):
        # Check if source is tainted
        is_tainted = False
        if isinstance(node.value, ast.Call):
            func_name = self._get_name(node.value.func)
            if any(s in func_name for s in self.SOURCES):
                is_tainted = True
        elif isinstance(node.value, ast.Name):
            if node.value.id in self.tainted_vars:
                is_tainted = True

        # Propagate taint
        if is_tainted:
            for target in node.targets:
                if isinstance(target, ast.Name):
                    self.tainted_vars.add(target.id)

        self.generic_visit(node)

    def visit_Call(self, node):
        # Check if this is a sink (AI call)
        func_name = self._get_name(node.func)
        if any(p in func_name for p in PythonASTAnalyzer.AI_SDK_PATTERNS):
            # Check positional arguments
            for arg in node.args:
                if self._check_taint(arg):
                    self.detected_flows.append(
                        {
                            "source": "tainted_var",
                            "sink": func_name,
                            "line": node.lineno,
                            "var": self._get_tainted_var(arg),
                        }
                    )

            # Check keyword arguments
            for keyword in node.keywords:
                if self._check_taint(keyword.value):
                    self.detected_flows.append(
                        {
                            "source": "tainted_var",
                            "sink": func_name,
                            "line": node.lineno,
                            "var": self._get_tainted_var(keyword.value),
                        }
                    )

        self.generic_visit(node)

    def _check_taint(self, node) -> bool:
        """Recursively check if a node contains tainted variables"""
        if isinstance(node, ast.Name):
            return node.id in self.tainted_vars
        elif isinstance(node, ast.List):
            return any(self._check_taint(elt) for elt in node.elts)
        elif isinstance(node, ast.Dict):
            return any(self._check_taint(val) for val in node.values)
        elif isinstance(node, ast.Call):
            # Check if call itself is a source
            name = self._get_name(node.func)
            if any(s in name for s in self.SOURCES):
                return True
            # Or arguments are tainted
            return any(self._check_taint(arg) for arg in node.args)
        elif isinstance(node, ast.BinOp):
            return self._check_taint(node.left) or self._check_taint(node.right)
        return False

    def _get_tainted_var(self, node) -> str:
        """Helper to extract name of tainted variable for reporting"""
        if isinstance(node, ast.Name):
            return node.id
        return "<complex_expression>"

    def _get_name(self, node):
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_name(node.value)}.{node.attr}"
        return ""


class CustomRuleEngine:
    """Evaluates custom regex-based security rules"""

    def __init__(self, rules: List[Dict[str, str]]):
        self.rules = rules

    def check_rules(self, source_code: str) -> Dict[str, bool]:
        results = {}
        for rule in self.rules:
            rule_id = rule.get("id")
            pattern = rule.get("pattern")
            if rule_id and pattern:
                results[rule_id] = bool(re.search(pattern, source_code, re.IGNORECASE))
        return results


def analyze_file(
    file_path: Path, custom_rules: List[Dict[str, str]] = None
) -> tuple[List[AICall], Dict[str, bool]]:
    """
    Analyze a file for AI calls and security patterns.

    Args:
        file_path: Path to the file to analyze
        custom_rules: Optional list of custom rules (dicts with 'id' and 'pattern')

    Returns:
        tuple: (list of AICall objects, dict of security pattern flags)
    """
    security = {}
    calls = []

    if file_path.suffix == ".py":
        analyzer = PythonASTAnalyzer(file_path)
        calls = analyzer.extract_ai_calls()
        security = analyzer.check_security_patterns()

        # Run Call Graph Analysis
        if analyzer.tree:
            cg = CallGraphAnalyzer(analyzer.tree)
            flows = cg.analyze()
            if flows:
                security["has_tainted_data_flow"] = True
                security["tainted_flows"] = flows

    elif file_path.suffix in [".ts", ".tsx", ".js", ".jsx"]:
        analyzer = TypeScriptASTAnalyzer(file_path)
        calls = analyzer.extract_ai_calls()
        security = {}  # TODO: Implement basic security patterns for TS/JS

    # Apply Custom Rules
    try:
        if custom_rules:
            source = file_path.read_text(encoding="utf-8")
            engine = CustomRuleEngine(custom_rules)
            custom_results = engine.check_rules(source)
            security.update(custom_results)
    except Exception:
        pass

    return calls, security
