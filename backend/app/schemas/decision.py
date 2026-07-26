from typing import Optional
from pydantic import BaseModel, Field, UUID4

class DecisionAssessmentSchema(BaseModel):
    decision_id: UUID4
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    
    # Input Confidences
    prediction_confidence: float = Field(0.0, ge=0.0, le=1.0)
    root_cause_confidence: float = Field(0.0, ge=0.0, le=1.0)
    similarity_confidence: float = Field(0.0, ge=0.0, le=1.0)
    recommendation_confidence: float = Field(0.0, ge=0.0, le=1.0)
    simulation_confidence: float = Field(0.0, ge=0.0, le=1.0)
    timeline_confidence: float = Field(0.0, ge=0.0, le=1.0)
    
    # Outputs
    overall_decision_confidence: float = Field(..., ge=0.0, le=100.0)
    decision_reliability: str = Field(..., description="HIGH, MEDIUM, LOW")
    risk_level: str = Field(..., description="CRITICAL, HIGH, MODERATE, LOW")
    recommendation_acceptance_score: float = Field(..., ge=0.0, le=100.0)
    decision_status: str = Field(..., description="APPROVE, REVIEW, REJECT")
    decision_summary: str
