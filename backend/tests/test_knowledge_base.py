import pytest
import uuid
from datetime import datetime, timezone
from app.schemas.knowledge_base import (
    ProcessVariableCreate,
    GradeRecipeCreate, RecipeParameterCreate,
    ProcessConstraintCreate
)

def test_process_variable_schema():
    machine_id = uuid.uuid4()
    pv = ProcessVariableCreate(
        machine_id=machine_id,
        dcs_tag_name="PT_101",
        canonical_name="Steam_Pressure",
        display_name="Steam Pressure",
        variable_type="ANALOG",
        engineering_unit="kPa",
        expected_range_low=300.0,
        expected_range_high=500.0
    )
    assert pv.dcs_tag_name == "PT_101"
    assert pv.is_ml_feature is True # Default

def test_grade_recipe_schema():
    grade_id = uuid.uuid4()
    var_id = uuid.uuid4()
    
    param = RecipeParameterCreate(
        variable_id=var_id,
        target_value=150.0,
        tolerance_pct=2.5,
        limit_high=152.0,
        limit_low=148.0
    )
    
    recipe = GradeRecipeCreate(
        grade_id=grade_id,
        effective_from=datetime.now(timezone.utc),
        notes="Winter mix",
        parameters=[param]
    )
    
    assert recipe.version == 1
    assert len(recipe.parameters) == 1
    assert recipe.parameters[0].target_value == 150.0

def test_process_constraint_schema():
    machine_id = uuid.uuid4()
    var_id = uuid.uuid4()
    
    constraint = ProcessConstraintCreate(
        machine_id=machine_id,
        variable_id=var_id,
        constraint_type="SAFETY",
        hard_max=450.0
    )
    assert constraint.hard_max == 450.0
