import pytest
import uuid
from app.schemas.recommendation import RecommendationSchema, RecommendedSetpointSchema
from app.services.recommendation.safety import SafetyValidator
from app.services.recommendation.ranking import RecommendationRanker
from app.services.recommendation.optimizer import MultiObjectiveOptimizer

def test_multi_objective_optimizer():
    prediction = {"risk_class": "WARNING"}
    context = {}
    
    candidates = MultiObjectiveOptimizer.generate_candidates(prediction, context)
    assert len(candidates) == 3
    assert all(c.expected_improvement_pct > 0.0 for c in candidates)

def test_safety_validator():
    candidate = RecommendationSchema(
        recommendation_id=uuid.uuid4(),
        rank=0,
        expected_basis_weight=150.0,
        expected_stabilization_time_minutes=20.0,
        expected_improvement_pct=15.0,
        confidence_score=0.9,
        safety_status="PENDING",
        engineering_rationale="Test",
        setpoints=[
            RecommendedSetpointSchema(
                tag_name="Steam_Pressure",
                current_value=400.0,
                recommended_value=460.0, # This will exceed the 450 limit
                uom="kPa"
            )
        ]
    )
    
    machine_limits = {"max_steam_pressure_kpa": 450.0}
    
    validated = SafetyValidator.validate([candidate], machine_limits)
    assert validated[0].safety_status == "REJECTED"
    assert "exceeds maximum" in validated[0].engineering_rationale

def test_recommendation_ranker():
    safe1 = RecommendationSchema(
        recommendation_id=uuid.uuid4(), rank=0,
        expected_basis_weight=150.0, expected_stabilization_time_minutes=20.0,
        expected_improvement_pct=20.0, confidence_score=0.9,
        safety_status="SAFE", engineering_rationale="Test"
    )
    safe2 = RecommendationSchema(
        recommendation_id=uuid.uuid4(), rank=0,
        expected_basis_weight=150.0, expected_stabilization_time_minutes=15.0,
        expected_improvement_pct=40.0, # Better improvement, but might reduce confidence
        confidence_score=0.9,
        safety_status="SAFE", engineering_rationale="Test"
    )
    
    ranked = RecommendationRanker.rank_and_score([safe1, safe2], similarity_confidence=0.8)
    
    assert len(ranked) == 2
    # The 40% improvement should be ranked #1
    assert ranked[0].expected_improvement_pct == 40.0
    assert ranked[0].rank == 1
    
    # Confidence calculation:
    # safe2 (rank 1): base 0.9 - 0.1 (high imp) = 0.8
    # final = (0.8 * 0.7) + (0.8 * 0.3) = 0.56 + 0.24 = 0.8
    assert ranked[0].confidence_score == 0.80
    
    # safe1 (rank 2): base 0.9
    # final = (0.9 * 0.7) + (0.8 * 0.3) = 0.63 + 0.24 = 0.87
    assert ranked[1].confidence_score == 0.87
