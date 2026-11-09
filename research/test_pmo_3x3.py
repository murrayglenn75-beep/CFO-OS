import unittest
from pmo_3x3 import Project, evaluate

class Governance3x3Tests(unittest.TestCase):
    def setUp(self):
        self.project = Project("RPA", "1000.00", "200.00", "0.25", "400.00", "owner")
    def test_value_effort_risk(self):
        result = evaluate(self.project)
        self.assertEqual(result["risk_contingency"], "100.00")
        self.assertEqual(result["expected_net_value"], "700.00")
    def test_needs_human_decision(self):
        self.assertEqual(evaluate(self.project)["decision_status"], "requires_human_review")
    def test_probability_bounds(self):
        p = self.project
        with self.assertRaises(ValueError):
            evaluate(Project(p.name,p.estimated_benefit,p.estimated_effort_cost,"1.2",p.risk_impact,p.owner))
    def test_negative_cost(self):
        p=self.project
        with self.assertRaises(ValueError):
            evaluate(Project(p.name,p.estimated_benefit,"-2",p.risk_probability,p.risk_impact,p.owner))
    def test_missing_owner(self):
        p=self.project
        with self.assertRaises(ValueError):
            evaluate(Project(p.name,p.estimated_benefit,p.estimated_effort_cost,p.risk_probability,p.risk_impact,""))
    def test_precision(self):
        p=self.project
        with self.assertRaises(ValueError):
            evaluate(Project(p.name,"10.999",p.estimated_effort_cost,p.risk_probability,p.risk_impact,p.owner))
if __name__ == "__main__":
    unittest.main()
