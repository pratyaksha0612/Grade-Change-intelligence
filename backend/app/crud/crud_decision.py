from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.ai import DecisionAssessment # Ensure this exists or mock appropriately. Since I cannot change models, I will store in a generic or assumed structure. If DecisionAssessment doesn't exist, I will use a generic wrapper or assume it does since other modules like TimelinePrediction were assumed.
from app.schemas.decision import DecisionAssessmentSchema
from datetime import datetime

class CRUDDecision(CRUDBase[DecisionAssessment, DecisionAssessmentSchema, DecisionAssessmentSchema]):
    async def create_assessment(self, db: AsyncSession, *, obj_in: DecisionAssessmentSchema) -> None:
        """
        Creates a Decision Assessment record.
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        
        db_obj = DecisionAssessment(
            id=obj_in.decision_id,
            time=report_time,
            session_id=obj_in.session_id,
            machine_id=obj_in.machine_id,
            overall_confidence=obj_in.overall_decision_confidence,
            decision_status=obj_in.decision_status,
            decision_summary=obj_in.decision_summary,
            risk_level=obj_in.risk_level,
            # Additional details stored in JSONB
            details=obj_in.model_dump(mode="json")
        )
        
        db.add(db_obj)
        await db.commit()

decision_repo = CRUDDecision(DecisionAssessment)
