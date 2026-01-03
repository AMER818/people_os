import os
import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from audit.ast_utils import TypeScriptASTAnalyzer


class TestTypeScriptAST(unittest.TestCase):
    def setUp(self):
        self.test_file = Path("test_ts_ast_temp.ts")

    def tearDown(self):
        if self.test_file.exists():
            self.test_file.unlink()

    def test_ts_call_extraction(self):
        code = """
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
    temperature: 0.7,
  });

  console.log(completion.choices[0]);
}
"""
        self.test_file.write_text(code, encoding="utf-8")

        analyzer = TypeScriptASTAnalyzer(self.test_file)
        calls = analyzer.extract_ai_calls()

        self.assertTrue(len(calls) > 0, "Should find at least one call")
        call = calls[0]
        self.assertIn("create", call.function_name)
        self.assertEqual(call.model, "gpt-3.5-turbo")
        self.assertEqual(call.temperature, 0.7)


if __name__ == "__main__":
    unittest.main()
