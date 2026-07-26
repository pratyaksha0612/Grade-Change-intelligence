import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base, UUIDMixin, TimestampMixin

class OperatorFeedback(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "fb_operator_feedback"
    
    recommendation_id: Mapped[uuid.UUID] = mapped_column(unique=True)
    session_id: Mapped[uuid.UUID] = mapped_column(index=True)
    operator_id: Mapped[uuid.UUID] = mapped_column(index=True)
    
    decision: Mapped[str] = mapped_column(String(10), index=True) # ACCEPT, REJECT, MODIFY, IGNORE
    reject_reason: Mapped[Optional[str]] = mapped_column(String(50))
    reject_comment: Mapped[Optional[str]] = mapped_column(Text)
    response_time_sec: Mapped[float] = mapped_column(Numeric(6, 2))
    viewed_explanation: Mapped[bool] = mapped_column(Boolean, default=False)
    ran_simulation: Mapped[bool] = mapped_column(Boolean, default=False)
    
    validation: Mapped[Optional["FeedbackValidation"]] = relationship("FeedbackValidation", back_populates="feedback", uselist=False)


class FeedbackValidation(Base, UUIDMixin):
    __tablename__ = "fb_feedback_validations"
    
    feedback_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("fb_operator_feedback.id"), unique=True)
    
    gate1_engagement_score: Mapped[float] = mapped_column(Numeric(5, 4))
    gate1_flags: Mapped[Optional[dict]] = mapped_column(JSONB)
    gate2_consistency_score: Mapped[float] = mapped_column(Numeric(5, 4))
    gate2_contradictions_found: Mapped[int] = mapped_column(default=0)
    gate3_outcome_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    gate3_outcome_match: Mapped[Optional[bool]] = mapped_column(Boolean)
    gate3_outcome_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 4))
    gate4_final_weight: Mapped[float] = mapped_column(Numeric(5, 4))
    
    operator_trust_score: Mapped[float] = mapped_column(Numeric(5, 4))
    is_included_in_training: Mapped[bool] = mapped_column(Boolean)
    exclusion_reason: Mapped[Optional[str]] = mapped_column(String(50))
    validated_at: Mapped[Optional[datetime]] = mapped_column()

    feedback: Mapped["OperatorFeedback"] = relationship("OperatorFeedback", back_populates="validation")
