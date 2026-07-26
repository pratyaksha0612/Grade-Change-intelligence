from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class HistoricalMatchSchema(BaseModel):
    historical_session_id: UUID4
    grade_from: str
    grade_to: str
    similarity_score: float = Field(..., ge=0.0, le=100.0)
    
    # Outcomes
    stabilization_time_minutes: float
    final_quality_outcome: str = Field(..., description="e.g. SUCCESS, OFF_SPEC, ABORTED")
    
    # Historical Context
    previous_machine_settings: Dict[str, float]
    operator_actions_taken: List[str]

class SimilarityReportSchema(BaseModel):
    report_id: UUID4
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    
    context_vector_id: Optional[UUID4] = None # Link to the context that triggered this
    confidence_in_matches: float = Field(..., ge=0.0, le=1.0)
    
    matches: List[HistoricalMatchSchema] = Field(default_factory=list)
