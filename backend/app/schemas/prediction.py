from typing import Optional, List
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class PredictionHorizon(BaseModel):
    horizon_sec: int
    predicted_bw: float
    predicted_deviation_pct: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None

class PredictionOutput(BaseModel):
    prediction_id: UUID4 = Field(..., description="Unique ID for this prediction inference")
    session_id: UUID4
    machine_id: UUID4
    timestamp: str
    model_version_id: UUID4
    
    risk_score: float = Field(..., ge=0.0, le=100.0, description="0-100 risk score")
    risk_class: str = Field(..., description="SAFE, WARNING, BREACH")
    probability_of_breach: float = Field(..., ge=0.0, le=1.0)
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    predicted_max_deviation_pct: float
    
    horizons: List[PredictionHorizon] = []
