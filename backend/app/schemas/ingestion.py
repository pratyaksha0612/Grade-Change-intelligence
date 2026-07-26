from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, UUID4
from datetime import datetime

class SensorReading(BaseModel):
    tag_name: str = Field(..., description="DCS Tag Name")
    value: float = Field(..., description="Raw sensor value")
    timestamp: datetime = Field(..., description="Timestamp of the reading from DCS")
    quality: str = Field("GOOD", description="OPC-UA quality code")

class IngestionPayload(BaseModel):
    machine_id: UUID4 = Field(..., description="UUID of the Paper Machine")
    readings: List[SensorReading] = Field(..., description="List of sensor readings")
    source: str = Field(..., description="Source system (e.g., OPC-UA, REST, HISTORIAN)")
    batch_id: Optional[str] = Field(None, description="Optional batch tracking ID")

class IngestionResponse(BaseModel):
    status: str
    message: str
    processed_count: int
    rejected_count: int
    errors: Optional[List[Dict[str, Any]]] = None
