import pytest
import numpy as np
from app.services.prediction.inference import InferenceEngine
from app.services.prediction.confidence import ConfidenceGenerator
from app.services.prediction.preprocessing import FeaturePreprocessor

def test_inference_engine():
    # Mock tensor: [current_bw, target_bw, deviation, machine_speed]
    tensor = np.array([160.0, 150.0, 10.0, 900.0])
    target_bw = 150.0
    
    max_dev, horizons = InferenceEngine.predict_trajectory(tensor, target_bw)
    
    assert len(horizons) == 12
    # The max deviation should be positive
    assert max_dev > 0.0
    
    # First horizon should be closer to 160 than target
    # Last horizon should be close to 150
    assert horizons[-1].predicted_bw < 155.0

def test_confidence_generator():
    # High deviation, low confidence
    conf = ConfidenceGenerator.calculate(max_deviation_pct=6.0, feature_completeness=1.0)
    assert conf == 0.80  # 0.95 - 0.15
    
    # Low deviation, high confidence
    conf2 = ConfidenceGenerator.calculate(max_deviation_pct=1.0, feature_completeness=1.0)
    assert conf2 == 0.95
    
    # Missing features penalize confidence
    conf3 = ConfidenceGenerator.calculate(max_deviation_pct=1.0, feature_completeness=0.8)
    assert conf3 == 0.95 * 0.8

def test_feature_preprocessor():
    context_payload = {
        "features": {"basis_weight_pv": 155.0, "machine_speed_pv": 950.0},
        "recipe_context": {"basis_weight_sp": 150.0}
    }
    
    tensor = FeaturePreprocessor.preprocess(context_payload)
    
    assert tensor.shape == (4,)
    assert tensor[0] == 155.0 # current
    assert tensor[1] == 150.0 # target
    assert tensor[2] == 5.0   # deviation
    assert tensor[3] == 950.0 # speed
