import uuid
from typing import Any
from datetime import datetime, timezone
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, Uuid

class Base(DeclarativeBase):
    id: Any
    __name__: str

    # Generate __tablename__ automatically
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Simple snake case logic or just use class name lower if preferred.
        # But we will explicitly set __tablename__ in models to match the spec.
        return cls.__name__.lower()


class UUIDMixin:
    """Provides a UUID primary key for models"""
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=lambda: uuid.uuid1()  # uuid7 equivalent conceptually if supported, fallback to uuid1 for time-ordering
    )


class TimestampMixin:
    """Provides created_at and updated_at timestamps"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )


class SoftDeleteMixin:
    """Provides a soft-delete boolean flag"""
    is_active: Mapped[bool] = mapped_column(default=True, index=True)
