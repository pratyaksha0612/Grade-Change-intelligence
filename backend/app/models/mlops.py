import uuid
from typing import Optional
from datetime import datetime, date
from sqlalchemy import String, Numeric, Integer, Text, Double
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base, UUIDMixin, TimestampMixin

class MLModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ml_models"
    
    model_name: Mapped[str] = mapped_column(String(100), unique=True)
    model_type: Mapped[str] = mapped_column(String(50))
    serving_module: Mapped[str] = mapped_column(String(20))
    description: Mapped[Optional[str]] = mapped_column(Text)
    framework: Mapped[str] = mapped_column(String(30))
    input_schema: Mapped[dict] = mapped_column(JSONB)
    output_schema: Mapped[dict] = mapped_column(JSONB)


class MLModelVersion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ml_model_versions"
    
    model_id: Mapped[uuid.UUID] = mapped_column()
    version_tag: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(20))
    artifact_path: Mapped[str] = mapped_column(String(500))
    artifact_size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    training_run_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    training_dataset_path: Mapped[Optional[str]] = mapped_column(String(500))
    training_dataset_size: Mapped[Optional[int]] = mapped_column(Integer)
    validation_metrics: Mapped[dict] = mapped_column(JSONB)
    
    promoted_at: Mapped[Optional[datetime]] = mapped_column()
    promoted_by: Mapped[Optional[uuid.UUID]] = mapped_column()
    retired_at: Mapped[Optional[datetime]] = mapped_column()
    retirement_reason: Mapped[Optional[str]] = mapped_column(String(100))


class MLTrainingRun(Base, UUIDMixin):
    __tablename__ = "ml_training_runs"
    
    model_id: Mapped[uuid.UUID] = mapped_column()
    trigger_type: Mapped[str] = mapped_column(String(30))
    triggered_by: Mapped[Optional[uuid.UUID]] = mapped_column()
    status: Mapped[str] = mapped_column(String(20))
    started_at: Mapped[datetime] = mapped_column()
    completed_at: Mapped[Optional[datetime]] = mapped_column()
    dataset_start_date: Mapped[date] = mapped_column()
    dataset_end_date: Mapped[date] = mapped_column()
    dataset_sample_count: Mapped[Optional[int]] = mapped_column(Integer)
    hyperparameters: Mapped[dict] = mapped_column(JSONB)
    training_metrics: Mapped[Optional[dict]] = mapped_column(JSONB)
    validation_metrics: Mapped[Optional[dict]] = mapped_column(JSONB)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    compute_time_sec: Mapped[Optional[float]] = mapped_column(Numeric(10, 1))


class MLDriftMetric(Base):
    __tablename__ = "ml_drift_metrics"
    
    time: Mapped[datetime] = mapped_column(primary_key=True)
    model_version_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    metric_type: Mapped[str] = mapped_column(String(30), primary_key=True)
    feature_name: Mapped[Optional[str]] = mapped_column(String(100), primary_key=True)
    metric_value: Mapped[float] = mapped_column(Double)
    threshold: Mapped[float] = mapped_column(Double)
    is_alert: Mapped[bool] = mapped_column(default=False)


class MLFeatureStoreMetadata(Base, UUIDMixin):
    __tablename__ = "ml_feature_store_metadata"
    
    feature_name: Mapped[str] = mapped_column(String(100), unique=True)
    display_name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    data_type: Mapped[str] = mapped_column(String(20))
    source_variable_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    derivation: Mapped[str] = mapped_column(String(30))
    derivation_logic: Mapped[Optional[str]] = mapped_column(Text)
    used_by_models: Mapped[Optional[dict]] = mapped_column(JSONB)
    statistics: Mapped[Optional[dict]] = mapped_column(JSONB)
    updated_at: Mapped[datetime] = mapped_column()
