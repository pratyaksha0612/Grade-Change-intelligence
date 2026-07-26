import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_knowledge_base import crud_grade_recipe
from app.schemas.knowledge_base import GradeRecipeCreate, GradeRecipeResponse
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class GradeRecipeManager:
    """
    Manages versioning and lifecycles of Grade Recipes.
    """
    
    @staticmethod
    async def create_new_version(db: AsyncSession, recipe_in: GradeRecipeCreate) -> GradeRecipeResponse:
        """
        Creates a new recipe version. 
        In a full implementation, this would logically deprecate the previous version.
        """
        # Ensure UTC time
        if recipe_in.effective_from.tzinfo is None:
            recipe_in.effective_from = recipe_in.effective_from.replace(tzinfo=timezone.utc)
            
        new_recipe = await crud_grade_recipe.create_with_parameters(db=db, obj_in=recipe_in)
        logger.info(f"Created new Grade Recipe version {new_recipe.version} for Grade {new_recipe.grade_id}")
        
        # Pydantic schema mapping
        return new_recipe

recipe_manager = GradeRecipeManager()
