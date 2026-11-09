"""Deterministic PMO 3x3 decision support; no external systems or LLM."""
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

def amount(value):
    if isinstance(value, bool) or not isinstance(value, (str, int, Decimal)):
        raise ValueError("Currency values must be decimal strings or integers")
    try:
        result = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError("Invalid currency") from exc
    if not result.is_finite() or result < 0 or result.as_tuple().exponent < -2:
        raise ValueError("Currency must be nonnegative and at most two decimal places")
    return result

@dataclass(frozen=True)
class Project:
    name: str
    estimated_benefit: str
    estimated_effort_cost: str
    risk_probability: str
    risk_impact: str
    owner: str

def evaluate(project: Project):
    if not project.name.strip() or not project.owner.strip():
        raise ValueError("Name and accountable owner are required")
    benefit = amount(project.estimated_benefit)
    effort = amount(project.estimated_effort_cost)
    impact = amount(project.risk_impact)
    try:
        p = Decimal(project.risk_probability)
    except (InvalidOperation, TypeError) as exc:
        raise ValueError("Invalid risk probability") from exc
    if not p.is_finite() or not 0 <= p <= 1:
        raise ValueError("Risk probability must be within 0..1")
    contingency = (p * impact).quantize(Decimal("0.01"))
    net_value = benefit - effort - contingency
    return {"name":project.name, "owner":project.owner,
            "value":str(benefit), "effort":str(effort),
            "risk_contingency":str(contingency), "risk_probability":str(p),
            "expected_net_value":str(net_value),
            "decision_status":"requires_human_review"}
