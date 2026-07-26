from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
import uuid

from app.db.session import get_db
from app.schemas.knowledge_base import (
    GradeRecipeCreate, GradeRecipeResponse,
    ProcessVariableCreate, ProcessVariableResponse,
    ProcessConstraintCreate, ProcessConstraintResponse,
    EngineeringRuleCreate, EngineeringRuleResponse
)
from app.services.knowledge_base.recipe_manager import recipe_manager
from app.services.knowledge_base.equipment_manager import equipment_manager
from app.services.knowledge_base.limits_manager import constraint_manager
from app.services.knowledge_base.rules_manager import rule_manager

router = APIRouter()

# --- Recipes ---
@router.post("/recipes", response_model=GradeRecipeResponse, status_code=201)
async def create_recipe(
    *,
    db: AsyncSession = Depends(get_db),
    recipe_in: GradeRecipeCreate,
) -> Any:
    """
    Create a new Grade Recipe version.
    """
    return await recipe_manager.create_new_version(db=db, recipe_in=recipe_in)

# --- Process Variables ---
@router.post("/variables", response_model=ProcessVariableResponse, status_code=201)
async def create_process_variable(
    *,
    db: AsyncSession = Depends(get_db),
    variable_in: ProcessVariableCreate,
) -> Any:
    """
    Register a new Process Variable (DCS Tag).
    """
    return await equipment_manager.add_process_variable(db=db, variable_in=variable_in)

@router.get("/variables/machine/{machine_id}", response_model=List[ProcessVariableResponse])
async def get_variables_for_machine(
    machine_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all active process variables for a specific machine.
    """
    return await equipment_manager.get_variables_for_machine(db=db, machine_id=machine_id)

# --- Constraints ---
@router.post("/constraints", response_model=ProcessConstraintResponse, status_code=201)
async def create_constraint(
    *,
    db: AsyncSession = Depends(get_db),
    constraint_in: ProcessConstraintCreate,
) -> Any:
    """
    Define a new process constraint or machine limit.
    """
    return await constraint_manager.add_constraint(db=db, constraint=constraint_in)

# --- Rules ---
@router.post("/rules", response_model=EngineeringRuleResponse, status_code=201)
async def create_rule(
    *,
    db: AsyncSession = Depends(get_db),
    rule_in: EngineeringRuleCreate,
) -> Any:
    """
    Create a new Engineering Rule (used by M4 Root Cause).
    """
    return await rule_manager.add_rule(db=db, rule_in=rule_in)
