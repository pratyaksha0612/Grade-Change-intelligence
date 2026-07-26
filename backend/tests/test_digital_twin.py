import pytest
import uuid
from app.services.digital_twin.simulator import ProcessResponsePredictor
from app.services.digital_twin.validator import SimulationValidator
from app.schemas.digital_twin import SimulationScenarioSchema, SimulatedTrajectorySchema

def test_process_response_predictor():
    setpoints = {"Steam_Pressure_Group_2": 420.0, "Machine_Speed": 900.0}
    context = {
        "features": {"basis_weight_pv": 155.0},
        "recipe_context": {"basis_weight_sp": 150.0}
    }
    
    # Test safe convergence
    scenario = ProcessResponsePredictor.simulate_scenario(str(uuid.uuid4()), setpoints, context)
    assert scenario.pass_safety_validation is True
    assert scenario.expected_risk_level == "SAFE"
    assert len(scenario.trajectory) == 12
    # The last point should be very close to 150.0
    assert abs(scenario.trajectory[-1].basis_weight - 150.0) < 1.0

def test_process_response_predictor_failure():
    setpoints = {"Steam_Pressure_Group_2": 460.0} # Will trigger failure in mock
    context = {
        "features": {"basis_weight_pv": 155.0},
        "recipe_context": {"basis_weight_sp": 150.0}
    }
    
    scenario = ProcessResponsePredictor.simulate_scenario(str(uuid.uuid4()), setpoints, context)
    assert scenario.pass_safety_validation is False
    assert scenario.expected_risk_level == "BREACH"
    assert "divergence" in scenario.validation_message

def test_simulation_validator():
    scenario = SimulationScenarioSchema(
        scenario_id=uuid.uuid4(),
        applied_setpoints={},
        expected_stabilization_time_minutes=20.0,
        expected_risk_level="SAFE",
        simulation_confidence=0.9,
        pass_safety_validation=True,
        validation_message="Test",
        trajectory=[
            # Last 3 points breach the 148-152 bounds
            SimulatedTrajectorySchema(horizon_sec=100, basis_weight=153.0, moisture=5.5, steam_pressure=400, machine_speed=900),
            SimulatedTrajectorySchema(horizon_sec=110, basis_weight=154.0, moisture=5.5, steam_pressure=400, machine_speed=900),
            SimulatedTrajectorySchema(horizon_sec=120, basis_weight=155.0, moisture=5.5, steam_pressure=400, machine_speed=900)
        ]
    )
    
    recipe_limits = {"basis_weight_low_limit": 148.0, "basis_weight_high_limit": 152.0}
    validated = SimulationValidator.validate([scenario], recipe_limits)
    
    assert validated[0].pass_safety_validation is False
    assert validated[0].expected_risk_level == "WARNING"
    assert "breaches recipe bounds" in validated[0].validation_message
