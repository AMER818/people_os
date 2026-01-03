import ast
import os
import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from audit.ast_utils import AICall, PythonASTAnalyzer


class TestParentNodeTracking(unittest.TestCase):
    def setUp(self):
        self.test_file = Path("test_parent_tracking_temp.py")

    def tearDown(self):
        if self.test_file.exists():
            self.test_file.unlink()

    def test_try_block_detection(self):
        code = """
import openai

def safe_call():
    try:
        openai.ChatCompletion.create(model="gpt-4")
    except Exception:
        pass

def unsafe_call():
    openai.ChatCompletion.create(model="gpt-4")
"""
        self.test_file.write_text(code, encoding="utf-8")

        analyzer = PythonASTAnalyzer(self.test_file)
        calls = analyzer.extract_ai_calls()

        self.assertEqual(len(calls), 2)

        safe_calls = [
            c
            for c in calls
            if c.function_name == "openai.ChatCompletion.create"
            and c.has_error_handling
        ]
        unsafe_calls = [
            c
            for c in calls
            if c.function_name == "openai.ChatCompletion.create"
            and not c.has_error_handling
        ]

        self.assertEqual(len(safe_calls), 1, "Should find 1 safe call")
        self.assertEqual(len(unsafe_calls), 1, "Should find 1 unsafe call")

        # Verify line numbers to be sure which is which
        self.assertTrue(safe_calls[0].line_number < unsafe_calls[0].line_number)


if __name__ == "__main__":
    unittest.main()
