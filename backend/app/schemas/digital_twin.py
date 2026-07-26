from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class SimulatedTrajectorySchema(BaseModel):
    horizon_sec: int
    basis_weight: float
    moisture: float
    steam_pressure: float
    machine_speed: float

class SimulationScenarioSchema(BaseModel):
    scenario_id: UUID4
    recommendation_id: Optional[UUID4] = None # Links to the M6 recommendation if applicable
    
    # Inputs
    applied_setpoints: Dict[str, float]
    
    # Expected Outputs
    expected_stabilization_time_minutes: float
    expected_risk_level: str = Field(..., description="SAFE, WARNING, BREACH")
    simulation_confidence: float = Field(..., ge=0.0, le=1.0)
    
    # Validation
    pass_safety_validation: bool
    validation_message: str
    
    # Trajectory
    trajectory: List[SimulatedTrajectorySchema] = Field(default_factory=list)

class DigitalTwinReportSchema(BaseModel):
    simulation_id: UUID4
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    
    context_vector_id: Optional[UUID4] = None
    
    scenarios: List[SimulationScenarioSchema] = Field(default_factory=list)
