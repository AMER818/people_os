"""
Standard AI prompts for architectural and code quality reviews.
Used by the AI Layer Analyzer for deeper semantic checks.
"""

ADR_COMPLIANCE_PROMPT = """
You are an expert software architect. Compare the following code structure against the provided Architecture Decision Records (ADRs).
Identify any "architectural drift" - where the code implementation has deviated from agreed patterns.
IMPORTANT: You must only use the provided ADR content as the source of truth. Do not invent rules.

ADRs:
{adr_content}

Current Structure:
{code_structure}

Report in JSON format:
{{
    "drift_detected": boolean,
    "violations": [
        {{
            "adr_id": "ADR-001",
            "issue": "Detailed description of drift",
            "severity": "Critical|Major|Minor",
            "recommendation": "How to realign"
        }}
    ]
}}
"""

CODE_QUALITY_SEMANTIC_PROMPT = """
Analyze the following code snippet for "semantic technical debt" - issues that static linters miss (e.g., leaky abstractions, poor naming, logic complexity).
Constraint: Base your analysis only on standard software engineering principles and the snippet provided.

Code:
{code_snippet}

Report in JSON format:
{{
    "debt_score": float (0-5 where 5 is perfect),
    "issues": [
        {{
            "type": "Abstraction Leak",
            "description": "...",
            "severity": "Major"
        }}
    ]
}}
"""
