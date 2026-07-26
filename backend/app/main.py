from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

from app.api.v1.api import api_router
from app.services.context.engine import context_engine
from app.services.prediction.engine import prediction_engine
from app.services.root_cause.engine import root_cause_engine
from app.services.similarity.engine import similarity_engine
from app.services.recommendation.engine import recommendation_engine
from app.services.digital_twin.engine import digital_twin_engine
from app.services.timeline.engine import timeline_engine
from app.services.decision.engine import decision_engine
from app.services.explainability.engine import explainability_engine

@app.on_event("startup")
async def startup_event():
    # Start background consumer loops
    await context_engine.start()
    await prediction_engine.start()
    await root_cause_engine.start()
    await similarity_engine.start()
    await recommendation_engine.start()
    await digital_twin_engine.start()
    await timeline_engine.start()
    await decision_engine.start()
    await explainability_engine.start()

@app.on_event("shutdown")
def shutdown_event():
    context_engine.stop()
    prediction_engine.stop()
    root_cause_engine.stop()
    similarity_engine.stop()
    recommendation_engine.stop()
    digital_twin_engine.stop()
    timeline_engine.stop()
    decision_engine.stop()
    explainability_engine.stop()

app.include_router(api_router, prefix=settings.API_V1_STR)
