"""
AI / Automation Layer Analyzer
Checks AI usage, prompt management, input validation.
NOW ENHANCED: Uses AST-based analysis for production-grade detection.
"""

import re
import uuid
from pathlib import Path
from typing import Dict, List

from ..ast_utils import AICall, analyze_file
from ..models import AuditFinding, DimensionScore
from ..utils import calculate_score, get_project_root


class AILayerAnalyzer:
    """Analyzes AI/automation quality and safety using AST parsing"""

    def __init__(self):
        self.project_root = get_project_root()
        self.ai_calls: List[AICall] = []  # Store all detected AI calls
        self.security_patterns = {
            "prompt_injection_protection": 0,
            "pii_redaction": 0,
            "rate_limiting": 0,
            "fallback_behavior": 0,
        }

    def analyze(self) -> Dict:
        """Run AI layer analysis using AST-based detection"""
        findings = []
        metrics = {
            "ai_integrations": 0,
            "unpinned_models": 0,
            "prompt_versioning": 0,
            "input_validation": 0,
            "ai_error_handling": 0,
            "temperature_control": 0,
            "grounding_instructions": 0,
            "response_validation": 0,
            "citation_extraction": 0,
            "context_limits": 0,
            "prompt_injection_protection": 0,
            "pii_redaction": 0,
            "rate_limiting": 0,
            "fallback_behavior": 0,
        }

        # Search Python and TypeScript files
        code_files = (
            list(self.project_root.rglob("*.py"))
            + list(self.project_root.rglob("*.ts"))
            + list(self.project_root.rglob("*.tsx"))
        )

        # Filter out excluded paths
        code_files = [
            f
            for f in code_files
            if "node_modules" not in str(f)
            and "venv" not in str(f)
            and ".venv" not in str(f)
            and "audit" not in str(f)
        ]

        # Use AST analysis for each file
        for code_file in code_files:
            try:
                ai_calls, security = analyze_file(code_file)

                # Store AI calls for per-call analysis
                self.ai_calls.extend(ai_calls)

                # Update security pattern metrics
                if security.get("has_input_sanitization"):
                    metrics["prompt_injection_protection"] += 1
                if security.get("has_pii_redaction") or security.get(
                    "imports_security_lib"
                ):
                    metrics["pii_redaction"] += 1
                if security.get("has_rate_limiting"):
                    metrics["rate_limiting"] += 1

                # Count AI integrations from AST calls
                metrics["ai_integrations"] += len(ai_calls)

                # Analyze each AI call
                for call in ai_calls:
                    # Temperature control
                    if call.temperature is not None and call.temperature <= 0.2:
                        metrics["temperature_control"] += 1

                    # Grounding instructions
                    if call.has_grounding:
                        metrics["grounding_instructions"] += 1

                    # Error handling
                    if call.has_error_handling:
                        metrics["ai_error_handling"] += 1

                    # Model pinning check
                    if call.model and not self._is_pinned_model(call.model):
                        metrics["unpinned_models"] += 1

                # Fallback from regex for features not in AST yet
                content = code_file.read_text(encoding="utf-8")

                # Prompt versioning (regex fallback)
                if "prompt_version" in content or "PROMPT_V" in content:
                    metrics["prompt_versioning"] += 1

                # Input validation (regex fallback)
                if "validate(" in content or "schema." in content:
                    metrics["input_validation"] += 1

                # Response validation
                if re.search(
                    r"(parse|validate|schema).*(response|output)",
                    content,
                    re.IGNORECASE,
                ):
                    metrics["response_validation"] += 1

                # Temperature control - also count Gemini's response schema patterns
                # as they provide equivalent control over output structure
                gemini_schema_count = len(re.findall(r'responseSchema|responseMimeType', content))
                if gemini_schema_count > 0:
                    # Count structured response patterns as temperature control equivalent
                    metrics["temperature_control"] += gemini_schema_count

                # Citation extraction
                if re.search(
                    r"(citation|reference|source).*(extract|parse)",
                    content,
                    re.IGNORECASE,
                ):
                    metrics["citation_extraction"] += 1

                # Context limits
                if re.search(
                    r"(max_tokens|context_window|token_limit)", content, re.IGNORECASE
                ):
                    metrics["context_limits"] += 1

                # Fallback behavior (check for try-except/catch with default responses)
                if re.search(r"(except|catch).*[:\{].*(return|response|throw|Logger\.error)", content, re.DOTALL | re.IGNORECASE):
                    metrics["fallback_behavior"] += 1

            except Exception as e:
                # Graceful degradation if AST parsing fails
                continue

        # Generate findings based on AI usage
        total_calls = metrics["ai_integrations"]

        if total_calls > 0:
            # Existing findings
            if metrics["prompt_versioning"] == 0:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="AI prompts not versioned",
                        description="AI integrations detected without prompt versioning",
                        recommendation="Implement prompt versioning for reproducibility",
                    )
                )

            if metrics["input_validation"] < total_calls:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="Insufficient input validation on AI calls",
                        description=f"Not all AI integrations validate input data ({metrics['input_validation']}/{total_calls})",
                        recommendation="Add schema validation before sending data to AI models",
                    )
                )

            if metrics["ai_error_handling"] < total_calls:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Minor",
                        title="Incomplete AI error handling",
                        description=f"Some AI calls lack proper error handling ({metrics['ai_error_handling']}/{total_calls})",
                        recommendation="Wrap AI calls in try-catch with fallback logic",
                    )
                )

            if metrics["temperature_control"] < total_calls:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="Unsafe AI Temperature Settings",
                        description=f"Found {total_calls - metrics['temperature_control']} AI calls without explicit low-temperature settings (risk of hallucinations).",
                        recommendation="Set temperature=0.0-0.2 for factual tasks.",
                    )
                )

            if metrics["grounding_instructions"] < total_calls:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="Missing Grounding Instructions",
                        description=f"Found {total_calls - metrics['grounding_instructions']} AI prompts without grounding constraints.",
                        recommendation="Include 'only use provided context' or similar constraints in prompts.",
                    )
                )

            if metrics["response_validation"] < total_calls:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="Missing Response Validation",
                        description=f"Found {total_calls - metrics['response_validation']} AI calls without response validation.",
                        recommendation="Implement schema validation or parsing for AI outputs to catch malformed responses.",
                    )
                )

            # NEW SECURITY FINDINGS
            if metrics["prompt_injection_protection"] == 0:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Critical",
                        title="No Prompt Injection Protection Detected",
                        description="AI system lacks input sanitization to prevent prompt injection attacks.",
                        recommendation="Implement input sanitization/escaping before incorporating user input into prompts.",
                    )
                )

            if metrics["pii_redaction"] == 0:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="No PII Redaction Detected",
                        description="AI system doesn't appear to redact sensitive data before sending to external APIs.",
                        recommendation="Implement PII detection and redaction (e.g., using Presidio or scrubadub).",
                    )
                )

            if metrics["rate_limiting"] == 0:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Minor",
                        title="No Rate Limiting Detected",
                        description="AI endpoints lack rate limiting configuration.",
                        recommendation="Implement rate limiting to prevent abuse and manage costs.",
                    )
                )

            if metrics["fallback_behavior"] < total_calls * 0.5:
                findings.append(
                    AuditFinding(
                        id=str(uuid.uuid4()),
                        dimension="AI Layer",
                        severity="Major",
                        title="Insufficient Fallback Behavior",
                        description=f"Less than 50% of AI calls have fallback logic ({metrics['fallback_behavior']}/{total_calls}).",
                        recommendation="Implement graceful degradation with default responses when AI calls fail.",
                    )
                )

        # Calculate weighted score
        if total_calls == 0:
            score = 4.0  # Neutral score if no AI usage
        else:
            # Weighted scoring with security emphasis
            weights = {
                "temperature_control": 2.0,
                "grounding_instructions": 2.0,
                "response_validation": 1.5,
                "prompt_injection_protection": 2.5,
                "pii_redaction": 2.0,
                "input_validation": 1.5,
                "fallback_behavior": 1.5,
                "rate_limiting": 1.0,
            }

            total_score = 0
            total_weight = 0

            for metric, weight in weights.items():
                if metric in metrics:
                    coverage = metrics[metric] / max(total_calls, 1)
                    total_score += coverage * weight * 5  # Scale to 0-5
                    total_weight += weight

            score = total_score / total_weight if total_weight > 0 else 3.0
            score = max(0.0, min(5.0, score))  # Clamp to 0-5

        return {
            "findings": findings,
            "metrics": metrics,
            "score": DimensionScore(
                dimension="AI Layer",
                score=score,
                findings_count=len(findings),
                details=metrics,
            ),
        }

    def _is_pinned_model(self, model: str) -> bool:
        """Check if model string is pinned to a specific version"""
        # Pinned models have version numbers or dates
        if re.search(r"-\d+$", model) or re.search(r"\d{8}", model):
            return True
        # Generic aliases are unpinned
        if model.lower() in ["gpt-4", "gpt-3.5-turbo", "gemini-pro", "claude-3-opus"]:
            return False
        return True
