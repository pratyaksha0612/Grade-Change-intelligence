from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class RecommendedSetpointSchema(BaseModel):
    tag_name: str
    current_value: float
    recommended_value: float
    uom: str = Field(..., description="Unit of Measure")
    rate_of_change: Optional[float] = Field(None, description="Max allowed rate of change per minute")

class RecommendationSchema(BaseModel):
    recommendation_id: UUID4
    rank: int
    
    setpoints: List[RecommendedSetpointSchema] = Field(default_factory=list)
    
    expected_basis_weight: float
    expected_stabilization_time_minutes: float
    expected_improvement_pct: float
    
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    safety_status: str = Field(..., description="SAFE, REJECTED, WARNING")
    engineering_rationale: str
    historical_evidence_reference: Optional[UUID4] = None # Link to a historical similarity report

class RecommendationReportSchema(BaseModel):
    report_id: UUID4
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    
    prediction_id: UUID4
    root_cause_id: Optional[UUID4] = None
    similarity_id: Optional[UUID4] = None
    
    recommendations: List[RecommendationSchema] = Field(default_factory=list)
