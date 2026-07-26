import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, ForeignKey, Boolean, Text, Double
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base, UUIDMixin, TimestampMixin

class Alarm(Base):
    __tablename__ = "alert_alarms"
    
    id: Mapped[uuid.UUID] = mapped_column(unique=True)
    time: Mapped[datetime] = mapped_column(primary_key=True)
    machine_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    
    variable_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    dcs_tag_name: Mapped[str] = mapped_column(String(100))
    alarm_type: Mapped[str] = mapped_column(String(30))
    priority: Mapped[str] = mapped_column(String(15))
    description: Mapped[str] = mapped_column(Text)
    value_at_alarm: Mapped[Optional[float]] = mapped_column(Double)
    limit_value: Mapped[Optional[float]] = mapped_column(Double)
    
    session_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True)
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[Optional[uuid.UUID]] = mapped_column()
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column()
    cleared_at: Mapped[Optional[datetime]] = mapped_column()
    
    is_shelved: Mapped[bool] = mapped_column(Boolean, default=False)
    shelved_until: Mapped[Optional[datetime]] = mapped_column()
    is_ai_correlated: Mapped[bool] = mapped_column(Boolean, default=False)
    correlated_prediction_id: Mapped[Optional[uuid.UUID]] = mapped_column()


class Notification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alert_notifications"
    
    user_id: Mapped[uuid.UUID] = mapped_column(index=True)
    notification_type: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(10))
    
    related_entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    related_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column()
