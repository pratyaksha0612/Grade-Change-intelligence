import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB, INET
from app.db.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_log"
    # Immutable append-only table. Primary key is a surrogate UUID, but it's partitioned by timestamp.
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=lambda: uuid.uuid4())
    timestamp: Mapped[datetime] = mapped_column(index=True)
    
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True)
    user_employee_id: Mapped[Optional[str]] = mapped_column(String(20))
    
    action: Mapped[str] = mapped_column(String(50), index=True)
    resource_type: Mapped[str] = mapped_column(String(50))
    resource_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    machine_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    session_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True)
    
    details: Mapped[dict] = mapped_column(JSONB)
    model_version: Mapped[Optional[str]] = mapped_column(String(30))
    ip_address: Mapped[str] = mapped_column(INET)
    client_info: Mapped[Optional[str]] = mapped_column(String(500))
    hash_chain: Mapped[str] = mapped_column(String(128))
