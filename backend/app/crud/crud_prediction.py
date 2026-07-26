from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.crud.base import CRUDBase
from app.models.ai import Prediction
from app.schemas.prediction import PredictionOutput
import uuid
from datetime import datetime, timezone

class CRUDPrediction(CRUDBase[Prediction, PredictionOutput, PredictionOutput]):
    async def create_prediction(self, db: AsyncSession, *, obj_in: PredictionOutput, feature_time: str) -> Prediction:
        """
        Creates a new prediction record in the database.
        """
        db_obj = Prediction(
            id=obj_in.prediction_id,
            time=datetime.now(timezone.utc),
            session_id=obj_in.session_id,
            machine_id=obj_in.machine_id,
            model_version_id=obj_in.model_version_id,
            risk_score=obj_in.risk_score,
            risk_class=obj_in.risk_class,
            predicted_max_deviation_pct=obj_in.predicted_max_deviation_pct,
            inference_latency_ms=10, # Mock latency
            feature_vector_time=datetime.fromisoformat(feature_time.replace('Z', '+00:00'))
        )
        
        # Note: In a production timescaleDB setup, we'd also batch insert PredictionHorizons.
        # Keeping it simple for the scaffold.
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

prediction = CRUDPrediction(Prediction)
