from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class ContextPayload(BaseModel):
    machine_id: UUID4
    timestamp: str
    features: Dict[str, float]
    anomalies: Dict[str, bool]

class EnrichedContext(BaseModel):
    machine_id: UUID4
    timestamp: str
    session_id: Optional[UUID4] = None
    state: str = Field(..., description="Current transition state (e.g. INITIATED, RAMPING, OFF_SPEC, STABILIZED, ON_SPEC)")
    
    # Recipe Limits (Dynamic context)
    recipe_context: Dict[str, Any] = Field(default_factory=dict)
    
    # Physical Limits (Static context)
    machine_context: Dict[str, Any] = Field(default_factory=dict)
    
    # Normalized features passed through from M1
    features: Dict[str, float]
    anomalies: Dict[str, bool]
