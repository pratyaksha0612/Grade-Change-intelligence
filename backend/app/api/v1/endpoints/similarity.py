from fastapi import APIRouter
from app.services.similarity.engine import similarity_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
def similarity_health():
    """
    Health check for the Historical Similarity Engine.
    """
    return {
        "status": "ok", 
        "service": "M5_Similarity_Engine", 
        "is_running": getattr(similarity_engine, 'is_running', False)
    }

@router.post("/trigger")
async def trigger_similarity_pipeline():
    """
    Manually triggers the background similarity engine loop if it stopped.
    """
    if not similarity_engine.is_running:
        await similarity_engine.start()
        return {"status": "started"}
    return {"status": "already_running"}
