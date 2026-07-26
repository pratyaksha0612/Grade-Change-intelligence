import logging
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_knowledge_base import crud_process_variable
from app.schemas.knowledge_base import ProcessVariableCreate, ProcessVariableResponse

logger = logging.getLogger(__name__)

class EquipmentManager:
    """
    Manages equipment metadata and process variable definitions.
    """
    
    @staticmethod
    async def get_variables_for_machine(db: AsyncSession, machine_id: uuid.UUID) -> List[ProcessVariableResponse]:
        """
        Retrieves active process variables for a given machine.
        """
        return await crud_process_variable.get_by_machine(db=db, machine_id=machine_id)

    @staticmethod
    async def add_process_variable(db: AsyncSession, variable_in: ProcessVariableCreate) -> ProcessVariableResponse:
        """
        Registers a new DCS tag into the knowledge base.
        """
        new_var = await crud_process_variable.create(db=db, obj_in=variable_in)
        logger.info(f"Registered new Process Variable: {new_var.dcs_tag_name}")
        return new_var

equipment_manager = EquipmentManager()
