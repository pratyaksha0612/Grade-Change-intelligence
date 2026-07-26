import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Boolean, Text, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class ProcessVariable(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "cfg_process_variables"
    __table_args__ = (
        UniqueConstraint('machine_id', 'dcs_tag_name', name='uq_process_vars_machine_dcs'),
        UniqueConstraint('machine_id', 'canonical_name', name='uq_process_vars_machine_canonical'),
    )
    
    machine_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_machines.id"), index=True)
    section_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("asset_machine_sections.id"))
    dcs_tag_name: Mapped[str] = mapped_column(String(100))
    canonical_name: Mapped[str] = mapped_column(String(100))
    display_name: Mapped[str] = mapped_column(String(200))
    variable_type: Mapped[str] = mapped_column(String(20))
    engineering_unit: Mapped[str] = mapped_column(String(30))
    
    expected_range_low: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    expected_range_high: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    hard_limit_low: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    hard_limit_high: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    
    sample_rate_ms: Mapped[int] = mapped_column(Integer, default=1000)
    imputation_strategy: Mapped[str] = mapped_column(String(30), default='LAST_KNOWN_GOOD')
    anomaly_threshold: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), default=3.5)
    
    has_setpoint: Mapped[bool] = mapped_column(Boolean, default=False)
    is_quality_variable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_ml_feature: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[Optional[str]] = mapped_column(Text)


class Grade(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "cfg_grades"
    __table_args__ = (UniqueConstraint('machine_id', 'grade_code', name='uq_grades_machine_code'),)
    
    machine_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_machines.id"))
    grade_code: Mapped[str] = mapped_column(String(30))
    display_name: Mapped[str] = mapped_column(String(100))
    basis_weight_target: Mapped[float] = mapped_column(Numeric(8, 2))
    product_category: Mapped[Optional[str]] = mapped_column(String(50))
    
    recipes: Mapped[List["GradeRecipe"]] = relationship("GradeRecipe", back_populates="grade")


class GradeRecipe(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cfg_grade_recipes"
    __table_args__ = (UniqueConstraint('grade_id', 'version', name='uq_recipes_grade_version'),)
    
    grade_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_grades.id"))
    version: Mapped[int] = mapped_column(Integer)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("iam_users.id"))
    approved_at: Mapped[Optional[datetime]] = mapped_column()
    effective_from: Mapped[datetime] = mapped_column()
    effective_until: Mapped[Optional[datetime]] = mapped_column()
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    grade: Mapped["Grade"] = relationship("Grade", back_populates="recipes")
    parameters: Mapped[List["RecipeParameter"]] = relationship("RecipeParameter", back_populates="recipe")


class RecipeParameter(Base, UUIDMixin):
    __tablename__ = "cfg_recipe_parameters"
    __table_args__ = (UniqueConstraint('recipe_id', 'variable_id', name='uq_recipe_params_recipe_var'),)
    
    recipe_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_grade_recipes.id"))
    variable_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_process_variables.id"))
    target_value: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    tolerance_pct: Mapped[Optional[float]] = mapped_column(Numeric(6, 3))
    limit_high: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    limit_low: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    ramp_rate: Mapped[Optional[float]] = mapped_column(Numeric(8, 4))
    ramp_strategy: Mapped[str] = mapped_column(String(30), default="LINEAR")

    recipe: Mapped["GradeRecipe"] = relationship("GradeRecipe", back_populates="parameters")


class ProcessConstraint(Base, UUIDMixin, SoftDeleteMixin):
    __tablename__ = "cfg_process_constraints"
    
    machine_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_machines.id"))
    variable_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_process_variables.id"))
    constraint_type: Mapped[str] = mapped_column(String(30))
    
    hard_min: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    hard_max: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    soft_min: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    soft_max: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    max_ramp_rate: Mapped[Optional[float]] = mapped_column(Numeric(8, 4))
    
    source: Mapped[str] = mapped_column(String(50))
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("iam_users.id"))


class EngineeringRule(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cfg_engineering_rules"
    
    machine_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_machines.id"))
    rule_code: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    rule_definition: Mapped[dict] = mapped_column(JSONB)
    category: Mapped[str] = mapped_column(String(30))
    confidence_level: Mapped[str] = mapped_column(String(20), default="HIGH")
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("iam_users.id"))
