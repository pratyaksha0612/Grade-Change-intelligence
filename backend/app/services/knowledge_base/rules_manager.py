import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_knowledge_base import crud_engineering_rule
from app.schemas.knowledge_base import EngineeringRuleCreate

logger = logging.getLogger(__name__)

class EngineeringRuleManager:
    """
    Manages semantic rules and engineering knowledge.
    """
    
    @staticmethod
    async def add_rule(db: AsyncSession, rule_in: EngineeringRuleCreate):
        """
        Adds a new engineering rule to the knowledge base.
        """
        new_rule = await crud_engineering_rule.create(db=db, obj_in=rule_in)
        logger.info(f"Added Engineering Rule: {new_rule.rule_code}")
        return new_rule

rule_manager = EngineeringRuleManager()
