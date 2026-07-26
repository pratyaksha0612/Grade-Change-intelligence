from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.crud.base import CRUDBase
from app.models.ai import Recommendation, RecommendationSetpoint
from app.schemas.recommendation import RecommendationReportSchema
import uuid
from datetime import datetime, timezone

class CRUDRecommendation(CRUDBase[Recommendation, RecommendationReportSchema, RecommendationReportSchema]):
    async def create_report(self, db: AsyncSession, *, obj_in: RecommendationReportSchema) -> None:
        """
        Creates recommendations and their associated setpoints.
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        
        for rec in obj_in.recommendations:
            # We don't save rejected recommendations to DB to save space, or maybe we do for audit?
            # Let's save all for audit.
            db_rec = Recommendation(
                id=rec.recommendation_id,
                time=report_time,
                session_id=obj_in.session_id,
                machine_id=obj_in.machine_id,
                prediction_id=obj_in.prediction_id,
                rank=rec.rank,
                expected_improvement_pct=rec.expected_improvement_pct,
                confidence_score=rec.confidence_score,
                safety_status=rec.safety_status,
                engineering_rationale=rec.engineering_rationale
            )
            db.add(db_rec)
            
            for sp in rec.setpoints:
                db_sp = RecommendationSetpoint(
                    time=report_time,
                    recommendation_id=rec.recommendation_id,
                    tag_name=sp.tag_name,
                    recommended_value=sp.recommended_value,
                    uom=sp.uom
                )
                db.add(db_sp)
                
        await db.commit()

recommendation_repo = CRUDRecommendation(Recommendation)
