from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.ai import ExplainabilityAudit # Assumed existing or generic usage
from app.schemas.explainability import ExplainabilityAuditSchema
from datetime import datetime

class CRUDExplainability(CRUDBase[ExplainabilityAudit, ExplainabilityAuditSchema, ExplainabilityAuditSchema]):
    async def create_audit_record(self, db: AsyncSession, *, obj_in: ExplainabilityAuditSchema) -> None:
        """
        Creates an Explainability Audit record.
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        
        db_obj = ExplainabilityAudit(
            id=obj_in.audit_id,
            time=report_time,
            session_id=obj_in.session_id,
            machine_id=obj_in.machine_id,
            decision_id=obj_in.decision_id,
            decision_status=obj_in.decision_status,
            engineering_rationale=obj_in.engineering_rationale,
            # Everything else packaged into JSONB
            trace_payload=obj_in.model_dump(mode="json")
        )
        
        db.add(db_obj)
        await db.commit()

explainability_repo = CRUDExplainability(ExplainabilityAudit)
