from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.crud.base import CRUDBase
from app.models.ai import DigitalTwinSimulation # Using the existing model from ai.py
from app.schemas.digital_twin import DigitalTwinReportSchema
import uuid
from datetime import datetime, timezone

class CRUDDigitalTwin(CRUDBase[DigitalTwinSimulation, DigitalTwinReportSchema, DigitalTwinReportSchema]):
    async def create_simulation_report(self, db: AsyncSession, *, obj_in: DigitalTwinReportSchema) -> None:
        """
        Creates digital twin simulations and their associated trajectories.
        For scaffold simplicity, we store the scenario directly into DigitalTwinSimulation model.
        In a full version, we might have Scenario and Trajectory child tables.
        """
        report_time = datetime.fromisoformat(obj_in.timestamp.replace('Z', '+00:00'))
        
        for scenario in obj_in.scenarios:
            db_sim = DigitalTwinSimulation(
                id=scenario.scenario_id,
                time=report_time,
                session_id=obj_in.session_id,
                machine_id=obj_in.machine_id,
                recommendation_id=scenario.recommendation_id,
                simulated_stabilization_time=scenario.expected_stabilization_time_minutes,
                is_safe=scenario.pass_safety_validation,
                # Store the trajectory as JSONB in the db
                trajectory_data=[t.model_dump() for t in scenario.trajectory]
            )
            db.add(db_sim)
            
        await db.commit()

digital_twin_repo = CRUDDigitalTwin(DigitalTwinSimulation)
