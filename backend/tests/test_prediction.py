import pytest
import numpy as np
import pandas as pd
from app.services.prediction.inference import InferenceEngine
from app.services.prediction.confidence import ConfidenceGenerator
from app.services.prediction.preprocessing import FeaturePreprocessor

def test_inference_engine():
    # Mock dataframe with necessary columns
    tensor = pd.DataFrame({
        'machine_speed_fpm': [900.0],
        'steam_pressure_psi': [120.0],
        'basis_weight_pv': [160.0]
    })
    target_bw = 150.0
    
    max_dev, horizons = InferenceEngine.predict_trajectory(tensor, target_bw)
    
    assert len(horizons) == 12
    # The max deviation should be positive
    assert max_dev >= 0.0
    
    # Last horizon should be close to 150
    assert horizons[-1].predicted_bw <= 155.0

def test_confidence_generator():
    # High deviation, low confidence
    conf = ConfidenceGenerator.calculate(max_deviation_pct=6.0, feature_completeness=1.0)
    assert conf == pytest.approx(0.80)  # 0.95 - 0.15
    
    # Low deviation, high confidence
    conf2 = ConfidenceGenerator.calculate(max_deviation_pct=1.0, feature_completeness=1.0)
    assert conf2 == pytest.approx(0.95)
    
    # Missing features penalize confidence
    conf3 = ConfidenceGenerator.calculate(max_deviation_pct=1.0, feature_completeness=0.8)
    assert conf3 == pytest.approx(0.95 * 0.8)

def test_feature_preprocessor():
    context_payload = {
        "features": {"machine_speed_fpm": 950.0, "steam_pressure_psi": 120.0},
        "recipe_context": {"basis_weight_sp": 150.0}
    }
    
    tensor = FeaturePreprocessor.preprocess(context_payload)
    
    assert tensor.shape == (1, 8)
    assert tensor['machine_speed_fpm'][0] == 950.0
    assert tensor['steam_pressure_psi'][0] == 120.0
