from typing import List, Optional
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class TimelineEventSchema(BaseModel):
    event_id: UUID4
    event_type: str = Field(..., description="E.g., STABILIZATION, INTERVENTION, ALARM, COMPLETION")
    variable_name: Optional[str] = None # E.g., "Basis Weight", "Machine Speed"
    expected_timestamp: str
    description: str
    confidence: float = Field(..., ge=0.0, le=1.0)

class TimelinePredictionSchema(BaseModel):
    timeline_id: UUID4
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    
    digital_twin_simulation_id: Optional[UUID4] = None
    
    transition_start_time: str
    overall_transition_duration_minutes: float
    expected_completion_time: str
    
    timeline_confidence: float = Field(..., ge=0.0, le=1.0)
    
    events: List[TimelineEventSchema] = Field(default_factory=list)
