from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.ai import TimelinePrediction # Ensure this model exists in models/ai.py
from app.schemas.timeline import TimelinePredictionSchema
from datetime import datetime

class CRUDTimeline(CRUDBase[TimelinePrediction, TimelinePredictionSchema, TimelinePredictionSchema]):
    async def create_timeline(self, db: AsyncSession, *, obj_in: TimelinePredictionSchema) -> None:
        """
        Creates a timeline prediction record and its associated events.
        (For scaffold, we'll serialize events into a JSONB column in TimelinePrediction)
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        start_time = datetime.fromisoformat(obj_in.transition_start_time.replace('Z', '+00:00'))
        completion_time = datetime.fromisoformat(obj_in.expected_completion_time.replace('Z', '+00:00'))
        
        db_obj = TimelinePrediction(
            id=obj_in.timeline_id,
            time=report_time,
            session_id=obj_in.session_id,
            machine_id=obj_in.machine_id,
            digital_twin_simulation_id=obj_in.digital_twin_simulation_id,
            transition_start_time=start_time,
            expected_completion_time=completion_time,
            overall_duration_minutes=obj_in.overall_transition_duration_minutes,
            timeline_confidence=obj_in.timeline_confidence,
            events_data=[e.model_dump(mode="json") for e in obj_in.events]
        )
        
        db.add(db_obj)
        await db.commit()

timeline_repo = CRUDTimeline(TimelinePrediction)
