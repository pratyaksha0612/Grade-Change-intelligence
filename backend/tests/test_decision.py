import pytest
from app.services.decision.fusion import ConfidenceFusion, RiskAggregator, DecisionQualityScorer

def test_confidence_fusion():
    inputs = {
        "prediction": 0.95,
        "root_cause": 0.90,
        "similarity": 0.85,
        "recommendation": 0.95,
        "simulation": 0.99,
        "timeline": 0.90
    }
    
    score, rel, acc = ConfidenceFusion.fuse(inputs)
    
    assert score > 90.0
    assert rel == "HIGH"
    assert acc > 90.0

def test_confidence_fusion_missing():
    inputs = {
        "prediction": 0.95,
        # missing root_cause and similarity
        "recommendation": 0.95,
        "simulation": 0.50,
        "timeline": 0.90
    }
    
    score, rel, acc = ConfidenceFusion.fuse(inputs)
    
    assert score < 90.0
    assert rel == "MEDIUM"
    # Acceptance drops significantly due to poor simulation score
    assert acc < 85.0

def test_risk_aggregator():
    assert RiskAggregator.aggregate_risk({"risk_flags": ["LOW", "HIGH"]}) == "HIGH"
    assert RiskAggregator.aggregate_risk({"risk_flags": ["LOW"]}) == "LOW"
    assert RiskAggregator.aggregate_risk({"risk_flags": ["CRITICAL", "LOW"]}) == "CRITICAL"

def test_decision_scorer():
    assert DecisionQualityScorer.score(90.0, "LOW")[0] == "APPROVE"
    assert DecisionQualityScorer.score(90.0, "HIGH")[0] == "REVIEW"
    assert DecisionQualityScorer.score(90.0, "CRITICAL")[0] == "REJECT"
    assert DecisionQualityScorer.score(50.0, "LOW")[0] == "REJECT"
