from fastapi import APIRouter
from app.services.timeline.engine import timeline_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
def timeline_health():
    """
    Health check for the M8 Timeline Prediction Engine.
    """
    return {
        "status": "ok", 
        "service": "M8_Timeline_Engine", 
        "is_running": getattr(timeline_engine, 'is_running', False)
    }

@router.post("/trigger")
async def trigger_pipeline(payload: dict = None):
    import uuid
    job_id = str(uuid.uuid4())
    return {"status": "accepted", "job_id": job_id}

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    return {"status": "completed"}

@router.get("/result/{job_id}")
async def get_result(job_id: str):
    from fastapi import HTTPException
    # Scaffolding: Force 404 to trigger the frontend's graceful mock fallback
    raise HTTPException(status_code=404, detail="Result not found in scaffolding mode")
