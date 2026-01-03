"""
Test file for Hallucination Containment Analyzer.
"""

from unittest.mock import MagicMock

openai = MagicMock()


def validate(x):
    return True


def unsafe_ai_call():
    # This should trigger low score (no temp, no grounding)
    response = openai.Completion.create(
        model="gpt-4", prompt="Tell me a story about unicorns."
    )


def safe_ai_call():
    # This should be counted as safe (low temp, grounding)
    # grounding: "only use provided"

    PROMPT_V1 = "some prompt"  # versioning

    try:
        # validate input
        validate("user_input")

        response = openai.ChatCompletion.create(
            model="gpt-4-0613",
            temperature=0.1,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Only use provided context.",
                },
                {
                    "role": "user",
                    "content": "Answer this question based on the context.",
                },
            ],
        )
    except Exception:
        pass
