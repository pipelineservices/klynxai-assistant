import unittest

from devops_orchestrator import policy


class PolicyTests(unittest.TestCase):
    def test_low_risk(self):
        assessment = policy.assess_risk("lint", "flake8", "lint failed")
        self.assertEqual(assessment.risk_level, "LOW")

    def test_high_risk(self):
        assessment = policy.assess_risk("deploy prod", "terraform apply", "iam policy")
        self.assertEqual(assessment.risk_level, "HIGH")


if __name__ == "__main__":
    unittest.main()
