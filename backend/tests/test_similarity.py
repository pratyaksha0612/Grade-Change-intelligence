import pytest
import uuid
from app.services.similarity.search import FeatureVectorSearch
from app.services.similarity.ranking import SimilarityRanker
from app.schemas.similarity import HistoricalMatchSchema

def test_feature_vector_search():
    context = {"features": {"basis_weight": 150}}
    matches = FeatureVectorSearch.search(context, top_k=5)
    
    assert len(matches) == 5
    for match in matches:
        assert isinstance(match, HistoricalMatchSchema)
        assert match.similarity_score >= 0.0
        assert match.similarity_score <= 100.0

def test_similarity_ranker():
    match1 = HistoricalMatchSchema(
        historical_session_id=uuid.uuid4(),
        grade_from="A", grade_to="B",
        similarity_score=85.0,
        stabilization_time_minutes=30.0,
        final_quality_outcome="SUCCESS",
        previous_machine_settings={},
        operator_actions_taken=[]
    )
    match2 = HistoricalMatchSchema(
        historical_session_id=uuid.uuid4(),
        grade_from="A", grade_to="B",
        similarity_score=95.0,
        stabilization_time_minutes=25.0,
        final_quality_outcome="SUCCESS",
        previous_machine_settings={},
        operator_actions_taken=[]
    )
    
    matches = [match1, match2]
    
    # Test Ranking (highest score first)
    ranked = SimilarityRanker.rank_matches(matches)
    assert ranked[0].similarity_score == 95.0
    assert ranked[1].similarity_score == 85.0
    
    # Test Confidence calculation
    conf_high = SimilarityRanker.calculate_confidence(ranked)
    assert conf_high == 0.95
    
    # Test penalty for low similarity
    match3 = HistoricalMatchSchema(
        historical_session_id=uuid.uuid4(),
        grade_from="A", grade_to="B",
        similarity_score=75.0,
        stabilization_time_minutes=40.0,
        final_quality_outcome="OFF_SPEC",
        previous_machine_settings={},
        operator_actions_taken=[]
    )
    
    ranked_low = SimilarityRanker.rank_matches([match3])
    conf_low = SimilarityRanker.calculate_confidence(ranked_low)
    # Penalized by 0.8
    assert conf_low == pytest.approx(0.75 * 0.8)
