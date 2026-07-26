from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.crud.base import CRUDBase
from app.models.ai import RootCauseReport, RootCauseFactor
from app.schemas.root_cause import RootCauseReportSchema
import uuid
from datetime import datetime, timezone

class CRUDRootCause(CRUDBase[RootCauseReport, RootCauseReportSchema, RootCauseReportSchema]):
    async def create_report(self, db: AsyncSession, *, obj_in: RootCauseReportSchema) -> RootCauseReport:
        """
        Creates a root cause report and its associated factors.
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        
        db_report = RootCauseReport(
            id=obj_in.report_id,
            time=report_time,
            session_id=obj_in.session_id,
            prediction_id=obj_in.prediction_id,
            summary_sentence=obj_in.summary_sentence,
            total_explained_pct=obj_in.total_explained_pct
        )
        
        db.add(db_report)
        
        for factor in obj_in.factors:
            db_factor = RootCauseFactor(
                time=report_time,
                report_id=obj_in.report_id,
                rank=factor.rank,
                variable_id=factor.variable_id,
                contribution_pct=factor.contribution_pct,
                shap_value=factor.shap_value,
                direction=factor.direction,
                current_value=factor.current_value,
                deviation_from_normal=factor.deviation_from_normal,
                engineering_context=factor.engineering_context,
                actionability=factor.actionability
            )
            db.add(db_factor)
            
        await db.commit()
        await db.refresh(db_report)
        return db_report

root_cause_repo = CRUDRootCause(RootCauseReport)
