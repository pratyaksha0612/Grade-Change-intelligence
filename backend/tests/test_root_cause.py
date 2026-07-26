import pytest
import uuid
from app.services.root_cause.attribution import FeatureAttributionEngine
from app.services.root_cause.ranking import RootCauseRanker

def test_feature_attribution_engine():
    # Test safe prediction (no SHAP needed)
    factors_safe = FeatureAttributionEngine.calculate_shap_values({"risk_class": "SAFE"})
    assert len(factors_safe) == 0
    
    # Test breach prediction
    factors_breach = FeatureAttributionEngine.calculate_shap_values({"risk_class": "BREACH"})
    assert len(factors_breach) == 2
    assert factors_breach[0]["variable_name"] == "Steam Pressure Group 2"
    
def test_engineering_rules():
    # Steam pressure increasing
    factor1 = {"variable_name": "Steam Pressure", "direction": "INCREASING"}
    rule1 = FeatureAttributionEngine.apply_engineering_rules(factor1)
    assert "moisture loss" in rule1.lower()
    
    # Speed decreasing
    factor2 = {"variable_name": "Machine Speed", "direction": "DECREASING"}
    rule2 = FeatureAttributionEngine.apply_engineering_rules(factor2)
    assert "stock build-up" in rule2.lower()
    
    # Fallback
    factor3 = {"variable_name": "Valve 5", "direction": "OPENING"}
    rule3 = FeatureAttributionEngine.apply_engineering_rules(factor3)
    assert "valve 5 is opening" in rule3.lower()

def test_root_cause_ranker():
    raw_factors = [
        {
            "variable_id": uuid.uuid4(),
            "variable_name": "Minor Issue",
            "contribution_pct": 5.0,
            "shap_value": 0.01,
            "direction": "INCREASING",
            "current_value": 10.0,
            "deviation_from_normal": 1.0,
            "actionability": "MONITOR"
        },
        {
            "variable_id": uuid.uuid4(),
            "variable_name": "Major Issue",
            "contribution_pct": 80.0,
            "shap_value": 0.9,
            "direction": "DECREASING",
            "current_value": 10.0,
            "deviation_from_normal": 1.0,
            "actionability": "ACTIONABLE"
        }
    ]
    
    ranked = RootCauseRanker.rank_factors(raw_factors)
    
    assert len(ranked) == 2
    # Major Issue should be rank 1
    assert ranked[0].variable_name == "Major Issue"
    assert ranked[0].rank == 1
    assert ranked[0].severity_class == "Critical"
    
    # Minor issue should be rank 2
    assert ranked[1].variable_name == "Minor Issue"
    assert ranked[1].rank == 2
    assert ranked[1].severity_class == "Low"
