import os
import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from audit.ast_utils import analyze_file


class TestCustomRules(unittest.TestCase):
    def setUp(self):
        self.test_file = Path("test_custom_rules_temp.py")

    def tearDown(self):
        if self.test_file.exists():
            self.test_file.unlink()

    def test_custom_rule_detection(self):
        # Constructed dynamically to avoid flagging this test file as having secrets
        p_var = "password"
        s_key = "SECRET_KEY"
        code = f"""
# {s_key} = "12345"
def connect_db():
    {p_var} = "password123"
"""
        self.test_file.write_text(code, encoding="utf-8")

        rules = [
            {"id": "no_secrets", "pattern": "SECRET_KEY"},
            {"id": "no_password", "pattern": "password.*="},
        ]

        calls, security = analyze_file(self.test_file, custom_rules=rules)

        self.assertTrue(security.get("no_secrets"), "Should detect SECRET_KEY")
        self.assertTrue(
            security.get("no_password"), "Should detect password assignment"
        )


if __name__ == "__main__":
    unittest.main()
