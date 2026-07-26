import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Integer, Double
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base, UUIDMixin, TimestampMixin

class GradeChangeSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ops_grade_change_sessions"
    
    machine_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_machines.id"), index=True)
    source_grade_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_grades.id"))
    target_grade_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_grades.id"))
    target_recipe_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cfg_grade_recipes.id"))
    
    detection_method: Mapped[str] = mapped_column(String(30))
    detected_at: Mapped[datetime] = mapped_column(index=True)
    started_at: Mapped[datetime] = mapped_column()
    completed_at: Mapped[Optional[datetime]] = mapped_column()
    aborted_at: Mapped[Optional[datetime]] = mapped_column()
    
    current_phase: Mapped[str] = mapped_column(String(30), default="INITIATED")
    duration_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    stabilization_time_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    max_bw_deviation_pct: Mapped[Optional[float]] = mapped_column(Numeric(6, 3))
    total_off_spec_time_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    
    outcome: Mapped[Optional[str]] = mapped_column(String(20))
    is_successful: Mapped[Optional[bool]] = mapped_column()
    operator_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("iam_users.id"), index=True)
    shift: Mapped[Optional[str]] = mapped_column(String(10))
    context_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    notes: Mapped[Optional[str]] = mapped_column(String)

    phases: Mapped[List["TransitionPhase"]] = relationship("TransitionPhase", back_populates="session")


class TransitionPhase(Base, UUIDMixin):
    __tablename__ = "ops_transition_phases"
    
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ops_grade_change_sessions.id"))
    phase: Mapped[str] = mapped_column(String(30))
    entered_at: Mapped[datetime] = mapped_column()
    exited_at: Mapped[Optional[datetime]] = mapped_column()
    duration_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    trigger_reason: Mapped[Optional[str]] = mapped_column(String(100))

    session: Mapped["GradeChangeSession"] = relationship("GradeChangeSession", back_populates="phases")


# Note: ops_sensor_data, ops_feature_vectors, etc. are TimescaleDB hypertables.
# They don't need a surrogate UUID, their PK is (time, machine_id, etc.)
# We model them directly below for SQLAlchemy insertion.

class SensorData(Base):
    __tablename__ = "ops_sensor_data"
    
    time: Mapped[datetime] = mapped_column(primary_key=True)
    machine_id: Mapped[uuid.UUID] = mapped_column(primary_key=True) # Logical FK
    variable_id: Mapped[uuid.UUID] = mapped_column(primary_key=True) # Logical FK
    canonical_name: Mapped[str] = mapped_column(String(100))
    value: Mapped[float] = mapped_column(Double)
    raw_value: Mapped[Optional[float]] = mapped_column(Double)
    quality: Mapped[str] = mapped_column(String(10), default="GOOD")
    z_score: Mapped[Optional[float]] = mapped_column(Double)
    is_anomaly: Mapped[Optional[bool]] = mapped_column(default=False)


class FeatureVector(Base):
    __tablename__ = "ops_feature_vectors"
    
    time: Mapped[datetime] = mapped_column(primary_key=True)
    machine_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    session_id: Mapped[Optional[uuid.UUID]] = mapped_column() # Logical FK
    feature_data: Mapped[dict] = mapped_column(JSONB)
    feature_count: Mapped[int] = mapped_column(Integer)
    imputed_count: Mapped[int] = mapped_column(Integer, default=0)
    completeness_pct: Mapped[float] = mapped_column(Numeric(5, 2))
