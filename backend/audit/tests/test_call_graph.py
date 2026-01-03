import os
import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from audit.ast_utils import analyze_file


class TestCallGraph(unittest.TestCase):
    def setUp(self):
        self.test_file = Path("test_call_graph_temp.py")

    def tearDown(self):
        if self.test_file.exists():
            self.test_file.unlink()

    def test_taint_flow(self):
        code = """
import openai

def unsafe_flow():
    user_query = input("Enter prompt: ")
    openai.ChatCompletion.create(model="gpt-4", messages=[{"role": "user", "content": user_query}])

def safe_flow():
    prompt = "fixed prompt"
    openai.ChatCompletion.create(model="gpt-4", messages=[{"role": "user", "content": prompt}])

def arg_flow(request):
    data = request.json()
    openai.ChatCompletion.create(model="gpt-4", messages=[{"role": "user", "content": data}])
"""
        self.test_file.write_text(code, encoding="utf-8")

        calls, security = analyze_file(self.test_file)

        self.assertTrue(
            security.get("has_tainted_data_flow"), "Should detect tainted data flow"
        )


if __name__ == "__main__":
    unittest.main()
