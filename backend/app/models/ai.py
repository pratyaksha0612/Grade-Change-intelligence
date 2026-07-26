import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Integer, Double, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base, UUIDMixin, TimestampMixin

# Note: Many of these are hypertables so they use composite keys involving time.

class Prediction(Base):
    __tablename__ = "ai_predictions"
    
    id: Mapped[uuid.UUID] = mapped_column(unique=True, index=True)
    time: Mapped[datetime] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(primary_key=True) # Logical FK to ops_grade_change_sessions
    machine_id: Mapped[uuid.UUID] = mapped_column()
    model_version_id: Mapped[uuid.UUID] = mapped_column()
    
    risk_score: Mapped[float] = mapped_column(Numeric(5, 2))
    risk_class: Mapped[str] = mapped_column(String(10), index=True) # SAFE, WARNING, BREACH
    predicted_max_deviation_pct: Mapped[float] = mapped_column(Numeric(6, 3))
    conformal_lower: Mapped[Optional[float]] = mapped_column(Numeric(8, 3))
    conformal_upper: Mapped[Optional[float]] = mapped_column(Numeric(8, 3))
    attention_entropy: Mapped[Optional[float]] = mapped_column(Double)
    inference_latency_ms: Mapped[int] = mapped_column(Integer)
    feature_vector_time: Mapped[datetime] = mapped_column()


class PredictionHorizon(Base):
    __tablename__ = "ai_prediction_horizons"
    
    time: Mapped[datetime] = mapped_column(primary_key=True)
    prediction_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    horizon_sec: Mapped[int] = mapped_column(primary_key=True)
    predicted_bw: Mapped[float] = mapped_column(Numeric(8, 3))
    predicted_deviation_pct: Mapped[float] = mapped_column(Numeric(6, 3))
    confidence_lower: Mapped[Optional[float]] = mapped_column(Numeric(8, 3))
    confidence_upper: Mapped[Optional[float]] = mapped_column(Numeric(8, 3))


class Recommendation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_recommendations"
    
    session_id: Mapped[uuid.UUID] = mapped_column(index=True)
    prediction_id: Mapped[uuid.UUID] = mapped_column()
    model_version_id: Mapped[uuid.UUID] = mapped_column()
    trigger_risk_class: Mapped[str] = mapped_column(String(10))
    
    predicted_outcome_bw_deviation_pct: Mapped[Optional[float]] = mapped_column(Numeric(6, 3))
    predicted_stabilization_improvement_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    on_spec_probability: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    
    optimization_converged: Mapped[bool] = mapped_column(Boolean)
    pareto_candidate_count: Mapped[int] = mapped_column(Integer)
    validation_status: Mapped[Optional[str]] = mapped_column(String(10)) # PASS, FAIL, WARN
    simulation_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    
    is_delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    delivered_at: Mapped[Optional[datetime]] = mapped_column()
    status: Mapped[str] = mapped_column(String(20), default="PENDING", index=True)

    setpoints: Mapped[List["RecommendationSetpoint"]] = relationship("RecommendationSetpoint", back_populates="recommendation")


class RecommendationSetpoint(Base, UUIDMixin):
    __tablename__ = "ai_recommendation_setpoints"
    
    recommendation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_recommendations.id"))
    variable_id: Mapped[uuid.UUID] = mapped_column()
    current_value: Mapped[float] = mapped_column(Numeric(12, 4))
    recommended_value: Mapped[float] = mapped_column(Numeric(12, 4))
    change_absolute: Mapped[float] = mapped_column(Numeric(12, 4))
    change_pct: Mapped[float] = mapped_column(Numeric(6, 3))
    ramp_rate: Mapped[Optional[float]] = mapped_column(Numeric(8, 4))

    recommendation: Mapped["Recommendation"] = relationship("Recommendation", back_populates="setpoints")


class ConfidenceScore(Base):
    __tablename__ = "ai_confidence_scores"
    
    time: Mapped[datetime] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    prediction_id: Mapped[uuid.UUID] = mapped_column()
    
    prediction_confidence: Mapped[float] = mapped_column(Numeric(5, 4))
    recommendation_confidence: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    historical_confidence: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    simulation_confidence: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    
    composite_confidence: Mapped[float] = mapped_column(Numeric(5, 4))
    trust_level: Mapped[str] = mapped_column(String(15))
    limiting_factor: Mapped[Optional[str]] = mapped_column(String(50))
    dimensions_available: Mapped[int] = mapped_column(Integer)


class RootCauseReport(Base):
    __tablename__ = "ai_root_cause_reports"
    
    id: Mapped[uuid.UUID] = mapped_column(unique=True)
    time: Mapped[datetime] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    prediction_id: Mapped[uuid.UUID] = mapped_column()
    summary_sentence: Mapped[str] = mapped_column(Text)
    total_explained_pct: Mapped[float] = mapped_column(Numeric(5, 2))


class RootCauseFactor(Base):
    __tablename__ = "ai_root_cause_factors"
    
    time: Mapped[datetime] = mapped_column(primary_key=True)
    report_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    rank: Mapped[int] = mapped_column(primary_key=True)
    
    variable_id: Mapped[uuid.UUID] = mapped_column()
    contribution_pct: Mapped[float] = mapped_column(Numeric(5, 2))
    shap_value: Mapped[float] = mapped_column(Double)
    direction: Mapped[str] = mapped_column(String(20))
    current_value: Mapped[float] = mapped_column(Numeric(12, 4))
    deviation_from_normal: Mapped[Optional[float]] = mapped_column(Numeric(12, 4))
    engineering_context: Mapped[Optional[str]] = mapped_column(Text)
    actionability: Mapped[str] = mapped_column(String(15))


class TimelinePrediction(Base):
    __tablename__ = "ai_timeline_predictions"
    
    id: Mapped[uuid.UUID] = mapped_column(unique=True)
    time: Mapped[datetime] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    current_phase: Mapped[str] = mapped_column(String(30))
    estimated_total_time_sec: Mapped[float] = mapped_column(Numeric(8, 1))
    confidence_interval_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    time_elapsed_sec: Mapped[float] = mapped_column(Numeric(8, 1))
    time_remaining_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    on_spec_probability: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    estimated_offgrade_sec: Mapped[Optional[float]] = mapped_column(Numeric(8, 1))
    peak_deviation_pct: Mapped[Optional[float]] = mapped_column(Numeric(6, 3))
    progress_status: Mapped[str] = mapped_column(String(15))


class DigitalTwinSimulation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_simulations"
    
    session_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True)
    machine_id: Mapped[uuid.UUID] = mapped_column()
    triggered_by: Mapped[str] = mapped_column(String(20))
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    model_version_id: Mapped[uuid.UUID] = mapped_column()
    scenario_count: Mapped[int] = mapped_column(Integer)
    horizon_sec: Mapped[int] = mapped_column(Integer)
    best_scenario_label: Mapped[Optional[str]] = mapped_column(String(50))
    overall_validation_status: Mapped[Optional[str]] = mapped_column(String(10))
    input_state_data: Mapped[dict] = mapped_column(JSONB)
    scenarios_data: Mapped[dict] = mapped_column(JSONB)
    metrics_data: Mapped[dict] = mapped_column(JSONB)
    simulation_confidence: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    compute_time_ms: Mapped[int] = mapped_column(Integer)


class SimilarityReport(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_similarity_reports"
    
    session_id: Mapped[uuid.UUID] = mapped_column(unique=True)
    candidates_searched: Mapped[int] = mapped_column(Integer)
    matches_found: Mapped[int] = mapped_column(Integer)
    overall_historical_confidence: Mapped[float] = mapped_column(Numeric(5, 4))
    pattern_summary: Mapped[Optional[str]] = mapped_column(Text)
    compute_time_ms: Mapped[int] = mapped_column(Integer)

    matches: Mapped[List["HistoricalMatch"]] = relationship("HistoricalMatch", back_populates="report")


class HistoricalMatch(Base, UUIDMixin):
    __tablename__ = "ai_historical_matches"
    
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_similarity_reports.id"))
    match_session_id: Mapped[uuid.UUID] = mapped_column()
    rank: Mapped[int] = mapped_column(Integer)
    similarity_score: Mapped[float] = mapped_column(Numeric(5, 4))
    dtw_distance: Mapped[float] = mapped_column(Double)
    context_bonus: Mapped[Optional[float]] = mapped_column(Numeric(5, 4), default=0)
    dtw_scores_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    operator_action: Mapped[Optional[str]] = mapped_column(Text)
    key_lesson: Mapped[Optional[str]] = mapped_column(Text)

    report: Mapped["SimilarityReport"] = relationship("SimilarityReport", back_populates="matches")


class DecisionAssessment(Base):
    __tablename__ = "ai_decision_assessments"
    
    id: Mapped[uuid.UUID] = mapped_column(unique=True)
    time: Mapped[datetime] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    machine_id: Mapped[uuid.UUID] = mapped_column()
    
    overall_confidence: Mapped[float] = mapped_column(Numeric(5, 4))
    decision_status: Mapped[str] = mapped_column(String(20))
    decision_summary: Mapped[str] = mapped_column(Text)
    risk_level: Mapped[str] = mapped_column(String(20))
    details: Mapped[dict] = mapped_column(JSONB)


class ExplainabilityAudit(Base):
    __tablename__ = "ai_explainability_audits"
    
    id: Mapped[uuid.UUID] = mapped_column(unique=True)
    time: Mapped[datetime] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    machine_id: Mapped[uuid.UUID] = mapped_column()
    decision_id: Mapped[uuid.UUID] = mapped_column()
    
    decision_status: Mapped[str] = mapped_column(String(20))
    engineering_rationale: Mapped[str] = mapped_column(Text)
    trace_payload: Mapped[dict] = mapped_column(JSONB)
