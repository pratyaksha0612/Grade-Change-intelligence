from fastapi import APIRouter
from app.services.context.engine import context_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
def context_health():
    """
    Health check for the M2 Context Engine.
    """
    return {
        "status": "ok", 
        "service": "M2_Context_Engine", 
        "is_running": getattr(context_engine, 'is_running', False)
    }

@router.post("/trigger")
async def trigger_context_pipeline():
    """
    Manually triggers the background context engine loop if it stopped.
    """
    if not context_engine.is_running:
        await context_engine.start()
        return {"status": "started"}
    return {"status": "already_running"}
