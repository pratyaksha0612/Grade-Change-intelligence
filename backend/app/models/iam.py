import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import INET
from app.db.base_class import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class UserRole(Base, TimestampMixin):
    __tablename__ = "iam_user_roles"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_users.id"), primary_key=True)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"), primary_key=True)
    assigned_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("iam_users.id"))


class RolePermission(Base, TimestampMixin):
    __tablename__ = "iam_role_permissions"
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"), primary_key=True)
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_permissions.id"), primary_key=True)


class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "iam_users"
    
    employee_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    display_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    auth_provider: Mapped[str] = mapped_column(String(50), default="LOCAL", index=True)
    
    # Needs to be string referencing asset_plants.id to avoid circular import if assets.py is separate,
    # or just use standard FK mapping.
    default_plant_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("asset_plants.id"))
    last_login_at: Mapped[Optional[datetime]] = mapped_column()
    login_count: Mapped[int] = mapped_column(Integer, default=0)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("iam_users.id"))
    
    # Relationships
    roles: Mapped[List["Role"]] = relationship("Role", secondary="iam_user_roles")
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="user")


class Role(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "iam_roles"
    
    name: Mapped[str] = mapped_column(String(50), unique=True)
    display_name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=False)
    
    permissions: Mapped[List["Permission"]] = relationship("Permission", secondary="iam_role_permissions")


class Permission(Base, UUIDMixin):
    __tablename__ = "iam_permissions"
    
    code: Mapped[str] = mapped_column(String(100), unique=True)
    resource: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)


class Session(Base, UUIDMixin):
    __tablename__ = "iam_sessions"
    
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_users.id"))
    machine_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("asset_machines.id"))
    ip_address: Mapped[str] = mapped_column(INET)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500))
    started_at: Mapped[datetime] = mapped_column()
    expires_at: Mapped[datetime] = mapped_column()
    ended_at: Mapped[Optional[datetime]] = mapped_column()
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")
