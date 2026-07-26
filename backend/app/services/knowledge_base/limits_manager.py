import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_knowledge_base import crud_process_constraint
from app.schemas.knowledge_base import ProcessConstraintCreate

logger = logging.getLogger(__name__)

class ProcessConstraintManager:
    """
    Manages safe operating windows and limits for equipment.
    """
    
    @staticmethod
    async def add_constraint(db: AsyncSession, constraint: ProcessConstraintCreate):
        """
        Adds a new safety or physical limit for a process variable.
        """
        new_constraint = await crud_process_constraint.create(db=db, obj_in=constraint)
        logger.info(f"Added new Process Constraint for variable {new_constraint.variable_id}")
        return new_constraint

constraint_manager = ProcessConstraintManager()
