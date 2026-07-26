from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
from app.crud.base import CRUDBase
from app.models.config import ProcessVariable, Grade, GradeRecipe, RecipeParameter, ProcessConstraint, EngineeringRule
from app.schemas.knowledge_base import (
    ProcessVariableCreate, GradeCreate, GradeRecipeCreate, 
    ProcessConstraintCreate, EngineeringRuleCreate
)

class CRUDProcessVariable(CRUDBase[ProcessVariable, ProcessVariableCreate, ProcessVariableCreate]):
    async def get_by_machine(self, db: AsyncSession, machine_id: uuid.UUID) -> List[ProcessVariable]:
        result = await db.execute(select(ProcessVariable).filter(ProcessVariable.machine_id == machine_id, ProcessVariable.is_deleted == False))
        return result.scalars().all()

class CRUDGradeRecipe(CRUDBase[GradeRecipe, GradeRecipeCreate, GradeRecipeCreate]):
    async def create_with_parameters(self, db: AsyncSession, *, obj_in: GradeRecipeCreate) -> GradeRecipe:
        # Create Recipe
        db_obj = GradeRecipe(
            grade_id=obj_in.grade_id,
            version=obj_in.version,
            is_current=obj_in.is_current,
            effective_from=obj_in.effective_from,
            notes=obj_in.notes
        )
        db.add(db_obj)
        await db.flush() # flush to get ID
        
        # Add parameters
        for param in obj_in.parameters:
            db_param = RecipeParameter(
                recipe_id=db_obj.id,
                variable_id=param.variable_id,
                target_value=param.target_value,
                tolerance_pct=param.tolerance_pct,
                limit_high=param.limit_high,
                limit_low=param.limit_low,
                ramp_rate=param.ramp_rate
            )
            db.add(db_param)
            
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

class CRUDProcessConstraint(CRUDBase[ProcessConstraint, ProcessConstraintCreate, ProcessConstraintCreate]):
    pass

class CRUDEngineeringRule(CRUDBase[EngineeringRule, EngineeringRuleCreate, EngineeringRuleCreate]):
    pass

crud_process_variable = CRUDProcessVariable(ProcessVariable)
crud_grade_recipe = CRUDGradeRecipe(GradeRecipe)
crud_process_constraint = CRUDProcessConstraint(ProcessConstraint)
crud_engineering_rule = CRUDEngineeringRule(EngineeringRule)
