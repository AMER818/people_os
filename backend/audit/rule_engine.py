"""
Rule Engine for Audit-as-Code
Loads YAML rules and applies them deterministically to audit signals.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml

from .models import DimensionScore


@dataclass
class AuditRule:
    """Parsed audit rule from YAML"""

    dimension: str
    version: str
    signals: Dict
    scoring: Dict
    thresholds: Dict
    meta: Dict


@dataclass
class RuleResult:
    """Result of applying a rule to signals"""

    dimension: str
    score: float
    violations: List[Dict]
    rule_version: str
    explanation: str


class RuleEngine:
    """Loads and applies audit rules"""

    def __init__(self, rules_dir: Optional[Path] = None):
        if rules_dir is None:
            self.rules_dir = Path(__file__).parent / "rules"
        else:
            self.rules_dir = rules_dir

        self.rules: Dict[str, AuditRule] = {}
        self._load_rules()

    def _load_rules(self):
        """Load all YAML rules from rules directory"""
        if not self.rules_dir.exists():
            print(f"⚠️ Rules directory not found: {self.rules_dir}")
            return

        for rule_file in self.rules_dir.glob("*.yml"):
            try:
                with open(rule_file, "r") as f:
                    rule_data = yaml.safe_load(f)

                rule = AuditRule(
                    dimension=rule_data["dimension"],
                    version=rule_data["version"],
                    signals=rule_data["signals"],
                    scoring=rule_data["scoring"],
                    thresholds=rule_data["thresholds"],
                    meta=rule_data["meta"],
                )

                self.rules[rule.dimension] = rule
                print(f"[OK] Loaded rule: {rule.dimension} ({rule.version})")

            except Exception as e:
                print(f"❌ Failed to load rule {rule_file}: {str(e)}")

    def apply_rule(self, dimension: str, signals: Dict) -> RuleResult:
        """
        Apply audit rule to collected signals.

        Args:
            dimension: Dimension name (e.g., 'code_quality')
            signals: Dict of signal values

        Returns:
            RuleResult with score, violations, and explanation
        """
        if dimension not in self.rules:
            raise ValueError(f"No rule found for dimension: {dimension}")

        rule = self.rules[dimension]
        score = rule.scoring["base_score"]
        violations = []
        explanation_parts = [f"Base score: {score}"]

        # Apply deductions
        for deduction in rule.scoring.get("deductions", []):
            signal_name = deduction["signal"]
            signal_value = signals.get(signal_name, 0)

            # Evaluate formula
            deduction_value = self._eval_formula(
                deduction["formula"], {"count": signal_value, "coverage": signal_value}
            )

            score -= deduction_value

            if deduction_value > 0:
                explanation_parts.append(
                    f"-{deduction_value:.2f} ({signal_name}: {signal_value})"
                )

            # Check for violations
            signal_config = rule.signals.get(signal_name, {})
            if "max" in signal_config and signal_value > signal_config["max"]:
                violations.append(
                    {
                        "signal": signal_name,
                        "value": signal_value,
                        "max": signal_config["max"],
                        "severity": signal_config["severity"],
                    }
                )

        # Apply bonuses (if any)
        for bonus in rule.scoring.get("bonuses", []):
            signal_name = bonus["signal"]
            signal_value = signals.get(signal_name, 0)

            bonus_value = self._eval_formula(bonus["formula"], {"count": signal_value})

            # Cap bonus if specified
            if "max_bonus" in bonus:
                bonus_value = min(bonus_value, bonus["max_bonus"])

            score += bonus_value

            if bonus_value > 0:
                explanation_parts.append(
                    f"+{bonus_value:.2f} ({signal_name}: {signal_value})"
                )

        # Clamp score to [0, 5]
        final_score = max(0, min(5, score))
        explanation_parts.append(f"Final score: {final_score:.1f}")

        return RuleResult(
            dimension=dimension,
            score=round(final_score, 1),
            violations=violations,
            rule_version=rule.version,
            explanation=" | ".join(explanation_parts),
        )

    def _eval_formula(self, formula: str, context: Dict) -> float:
        """
        Safely evaluate scoring formula.

        Args:
            formula: Formula string (e.g., "count * 0.05")
            context: Variables available in formula

        Returns:
            Calculated value
        """
        try:
            # Only allow safe mathematical operations
            allowed_names = {
                "count": context.get("count", 0),
                "value": context.get("count", 0),
                "coverage": context.get("coverage", 0),
                "max": max,
                "min": min,
                "abs": abs,
            }

            # Evaluate in restricted namespace
            result = eval(formula, {"__builtins__": {}}, allowed_names)
            return float(result)
        except Exception as e:
            print(f"⚠️ Formula evaluation failed: {formula} - {str(e)}")
            return 0.0

    def get_threshold(self, dimension: str, threshold_name: str) -> Optional[float]:
        """Get threshold value for a dimension"""
        if dimension in self.rules:
            return self.rules[dimension].thresholds.get(threshold_name)
        return None


class PolicyEvaluator:
    """Evaluates audit results against release gate policies"""

    def __init__(self, policy_path: Optional[Path] = None):
        if policy_path is None:
            self.policy_path = Path(__file__).parent / "policies" / "release-gates.yml"
        else:
            self.policy_path = policy_path

        self.policy_data = {}
        self._load_policies()

    def _load_policies(self):
        """Load release gate policies from YAML"""
        if not self.policy_path.exists():
            print(f"⚠️ Policy file not found: {self.policy_path}")
            return

        try:
            with open(self.policy_path, "r") as f:
                self.policy_data = yaml.safe_load(f)
            print(f"[OK] Loaded {len(self.policy_data.get('policies', {}))} policies")
        except Exception as e:
            print(f"❌ Failed to load policies: {str(e)}")

    def evaluate_policies(self, report: "AuditReport") -> List["PolicyResult"]:
        """Evaluate all defined policies against the audit report"""
        from .models import PolicyResult

        results = []
        if not self.policy_data:
            return results

        # Build execution context for rules
        context = {
            "overall_score": report.overall_score,
            "critical_count": report.critical_count,
            "major_count": report.major_count,
            "minor_count": report.minor_count,
            "risk_level": report.risk_level,
        }

        # Add dimension scores to context
        for ds in report.dimension_scores:
            dim_key = ds.dimension.lower().replace(" ", "_") + "_score"
            context[dim_key] = ds.score

            # Add raw signals (flattened)
            for signal, value in ds.details.items():
                context[signal] = value

        for name, policy in self.policy_data.get("policies", {}).items():
            rule = policy.get("rule", "False")
            enforced = policy.get("enforced", True)
            description = policy.get("description", "")

            # Safely evaluate rule
            passed, message = self._eval_policy_rule(rule, context)

            results.append(
                PolicyResult(
                    name=name,
                    pass_status=passed,
                    message=message if not passed else "Policy passed",
                    enforced=enforced,
                    rule=rule,
                )
            )

        return results

    def _eval_policy_rule(self, rule: str, context: Dict) -> Tuple[bool, str]:
        """Safely evaluate a policy boolean expression"""
        try:
            # Simple expression parser (supports >=, <=, ==, >, <, AND, OR)
            # Python's eval is safe here ONLY because we strictly control context
            # and it's internal logic, but for robustness we translate AND/OR
            py_rule = rule.replace(" AND ", " and ").replace(" OR ", " or ")

            # Define safe builtins
            safe_names = {k: v for k, v in context.items()}
            safe_names["__builtins__"] = {}

            result = eval(py_rule, {"__builtins__": {}}, safe_names)
            return bool(result), "Success"
        except Exception as e:
            return False, f"Rule evaluation failed: {str(e)}"


# Global instances
_rule_engine = None
_policy_evaluator = None


def get_rule_engine() -> RuleEngine:
    """Get global rule engine instance"""
    global _rule_engine
    if _rule_engine is None:
        _rule_engine = RuleEngine()
    return _rule_engine


def get_policy_evaluator() -> PolicyEvaluator:
    """Get global policy evaluator instance"""
    global _policy_evaluator
    if _policy_evaluator is None:
        _policy_evaluator = PolicyEvaluator()
    return _policy_evaluator
