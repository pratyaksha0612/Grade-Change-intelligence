from typing import List, Optional
from pydantic import BaseModel, UUID4, Field
from datetime import datetime

# Shared base for models with UUIDs
class BaseSchema(BaseModel):
    id: Optional[UUID4] = None

# ---- Equipment / Process Variable Schemas ----
class ProcessVariableBase(BaseModel):
    machine_id: UUID4
    section_id: Optional[UUID4] = None
    dcs_tag_name: str
    canonical_name: str
    display_name: str
    variable_type: str
    engineering_unit: str
    expected_range_low: Optional[float] = None
    expected_range_high: Optional[float] = None
    hard_limit_low: Optional[float] = None
    hard_limit_high: Optional[float] = None
    sample_rate_ms: int = 1000
    is_ml_feature: bool = True

class ProcessVariableCreate(ProcessVariableBase):
    pass

class ProcessVariableResponse(ProcessVariableBase, BaseSchema):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# ---- Grade and Recipe Schemas ----
class GradeBase(BaseModel):
    machine_id: UUID4
    grade_code: str
    display_name: str
    basis_weight_target: float
    product_category: Optional[str] = None

class GradeCreate(GradeBase):
    pass

class GradeResponse(GradeBase, BaseSchema):
    pass

class RecipeParameterBase(BaseModel):
    variable_id: UUID4
    target_value: Optional[float] = None
    tolerance_pct: Optional[float] = None
    limit_high: Optional[float] = None
    limit_low: Optional[float] = None
    ramp_rate: Optional[float] = None

class RecipeParameterCreate(RecipeParameterBase):
    pass

class GradeRecipeBase(BaseModel):
    grade_id: UUID4
    version: int = 1
    is_current: bool = True
    effective_from: datetime
    notes: Optional[str] = None

class GradeRecipeCreate(GradeRecipeBase):
    parameters: List[RecipeParameterCreate]

class GradeRecipeResponse(GradeRecipeBase, BaseSchema):
    parameters: List[RecipeParameterBase] = []

# ---- Constraints and Rules Schemas ----
class ProcessConstraintBase(BaseModel):
    machine_id: UUID4
    variable_id: UUID4
    constraint_type: str
    hard_min: Optional[float] = None
    hard_max: Optional[float] = None
    soft_min: Optional[float] = None
    soft_max: Optional[float] = None

class ProcessConstraintCreate(ProcessConstraintBase):
    pass

class ProcessConstraintResponse(ProcessConstraintBase, BaseSchema):
    pass

class EngineeringRuleBase(BaseModel):
    machine_id: UUID4
    rule_code: str
    description: str
    severity: str
    condition_expression: str
    action_message: str

class EngineeringRuleCreate(EngineeringRuleBase):
    pass

class EngineeringRuleResponse(EngineeringRuleBase, BaseSchema):
    pass
