import os
import tempfile
import unittest

from devops_orchestrator import idempotency, settings


class IdempotencyTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        settings.STATE_PATH = os.path.join(self.temp_dir.name, "state.jsonl")

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_set_once(self):
        self.assertTrue(idempotency.set_once("key", {"value": 1}))
        self.assertFalse(idempotency.set_once("key", {"value": 2}))
        self.assertEqual(idempotency.get("key")["value"], 1)


if __name__ == "__main__":
    unittest.main()
