from typing import List, Optional
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class RootCauseFactorSchema(BaseModel):
    variable_id: UUID4
    variable_name: str = Field(..., description="E.g., Steam Pressure, Machine Speed")
    rank: int = Field(..., description="1 is highest impact")
    contribution_pct: float = Field(..., ge=0.0, le=100.0)
    shap_value: float
    direction: str = Field(..., description="INCREASING, DECREASING")
    current_value: float
    deviation_from_normal: float
    severity_class: str = Field(..., description="Critical, High, Medium, Low")
    engineering_context: str = Field(..., description="Operator-friendly explanation")
    actionability: str = Field(..., description="ACTIONABLE, MONITOR, UNCONTROLLABLE")

class RootCauseReportSchema(BaseModel):
    report_id: UUID4 = Field(..., description="Unique ID for this root cause report")
    session_id: UUID4
    prediction_id: UUID4
    timestamp: str
    
    summary_sentence: str = Field(..., description="High-level engineering summary of the cause")
    total_explained_pct: float = Field(..., ge=0.0, le=100.0)
    
    factors: List[RootCauseFactorSchema] = Field(default_factory=list)
