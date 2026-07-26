from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.crud.base import CRUDBase
from app.models.ai import SimilarityReport, HistoricalMatch
from app.schemas.similarity import SimilarityReportSchema
import uuid
from datetime import datetime, timezone

class CRUDSimilarity(CRUDBase[SimilarityReport, SimilarityReportSchema, SimilarityReportSchema]):
    async def create_report(self, db: AsyncSession, *, obj_in: SimilarityReportSchema) -> SimilarityReport:
        """
        Creates a similarity report and its associated matches.
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        
        db_report = SimilarityReport(
            id=obj_in.report_id,
            time=report_time,
            session_id=obj_in.session_id,
            machine_id=obj_in.machine_id,
            confidence_in_matches=obj_in.confidence_in_matches
        )
        
        db.add(db_report)
        
        for match in obj_in.matches:
            db_match = HistoricalMatch(
                time=report_time,
                report_id=obj_in.report_id,
                historical_session_id=match.historical_session_id,
                similarity_score=match.similarity_score,
                stabilization_time_minutes=match.stabilization_time_minutes,
                final_quality_outcome=match.final_quality_outcome,
                operator_actions_taken=match.operator_actions_taken
            )
            db.add(db_match)
            
        await db.commit()
        await db.refresh(db_report)
        return db_report

similarity_repo = CRUDSimilarity(SimilarityReport)
