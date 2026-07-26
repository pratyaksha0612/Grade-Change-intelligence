from fastapi import APIRouter, HTTPException, Depends
from typing import Any
from app.schemas.ingestion import IngestionPayload, IngestionResponse
from app.services.ingestion.pipeline import ingestion_pipeline
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=IngestionResponse, status_code=202)
async def ingest_data(payload: IngestionPayload) -> Any:
    """
    Ingest sensor data from an industrial source (OPC-UA, REST, CSV).
    Data is validated, normalized, and published to Kafka asynchronously.
    """
    try:
        response = await ingestion_pipeline.process_payload(payload)
        if response.status == "FAILED":
            raise HTTPException(status_code=400, detail=response.model_dump())
        return response
    except Exception as e:
        logger.error(f"Ingestion endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during ingestion.")

@router.get("/health")
def ingestion_health():
    """
    Health check specifically for the ingestion pipeline dependencies.
    """
    # In a real app, ping Kafka and Redis here
    return {"status": "ok", "service": "M1_Ingestion"}
