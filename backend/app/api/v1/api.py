from fastapi import APIRouter
from app.api.v1.endpoints import ingestion, context, prediction, root_cause, similarity, recommendation, digital_twin, knowledge_base, timeline, decision, explainability, settings, dashboard, correlations

api_router = APIRouter()
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["Ingestion"])
api_router.include_router(context.router, prefix="/context", tags=["Context"])
api_router.include_router(prediction.router, prefix="/prediction", tags=["Prediction"])
api_router.include_router(root_cause.router, prefix="/root-cause", tags=["Root Cause"])
api_router.include_router(similarity.router, prefix="/similarity", tags=["Historical Similarity"])
api_router.include_router(recommendation.router, prefix="/recommendation", tags=["AI Recommendation"])
api_router.include_router(digital_twin.router, prefix="/digital-twin", tags=["Digital Twin"])
api_router.include_router(knowledge_base.router, prefix="/knowledge-base", tags=["Process Knowledge Base"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["Timeline Prediction"])
api_router.include_router(decision.router, prefix="/decision", tags=["Decision Intelligence"])
api_router.include_router(explainability.router, prefix="/explainability", tags=["Explainability"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(correlations.router, prefix="/correlations", tags=["Correlations"])
