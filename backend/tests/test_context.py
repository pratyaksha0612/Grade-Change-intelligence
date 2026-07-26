import pytest
from app.services.context.state_machine import GradeChangeStateMachine
from app.services.context.builder import FeatureVectorBuilder
from app.schemas.context import ContextPayload
import uuid

def test_state_machine_transitions():
    sm = GradeChangeStateMachine("machine-1")
    assert sm.state == 'STEADY_STATE'
    
    # Trigger initiated
    sm.trigger_initiate()
    assert sm.state == 'INITIATED'
    
    sm.trigger_ramp()
    assert sm.state == 'RAMPING'
    
    # Evaluate off spec
    features = {'basis_weight_pv': 160.0} # Target is 150.0, limits are 148-152
    recipe_limits = {
        'basis_weight_sp': 150.0,
        'basis_weight_low_limit': 148.0,
        'basis_weight_high_limit': 152.0
    }
    
    new_state = sm.evaluate_state(features, recipe_limits)
    assert new_state == 'OFF_SPEC'
    
    # Evaluate returning to spec
    features['basis_weight_pv'] = 150.5
    new_state = sm.evaluate_state(features, recipe_limits)
    assert new_state == 'STABILIZING'

def test_feature_vector_builder():
    payload = ContextPayload(
        machine_id=uuid.uuid4(),
        timestamp="2026-07-25T12:00:00Z",
        features={"temp": 100.0},
        anomalies={"temp": False}
    )
    
    enriched = FeatureVectorBuilder.build(
        payload=payload,
        state="RAMPING",
        recipe_context={"sp": 10},
        machine_context={"max": 100}
    )
    
    assert enriched.state == "RAMPING"
    assert enriched.recipe_context["sp"] == 10
    assert enriched.features["temp"] == 100.0
