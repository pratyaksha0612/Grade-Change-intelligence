from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, UUID4

class ExplainabilityAuditSchema(BaseModel):
    audit_id: UUID4
    decision_id: UUID4
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    
    # Trace Elements
    prediction_summary: str
    root_cause_summary: str
    historical_evidence_summary: str
    recommendation_summary: str
    digital_twin_validation_summary: str
    timeline_summary: str
    
    overall_decision_confidence: float = Field(..., ge=0.0, le=100.0)
    decision_status: str
    engineering_rationale: str
    
    # Detailed Trace payload
    supporting_evidence_payload: Dict[str, Any]
    
    # Metadata
    model_version_references: Dict[str, str] = Field(default_factory=dict)
