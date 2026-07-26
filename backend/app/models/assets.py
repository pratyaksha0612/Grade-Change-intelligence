import uuid
from typing import List, Optional
from sqlalchemy import String, Numeric, ForeignKey, Boolean, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Plant(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "asset_plants"
    
    plant_code: Mapped[str] = mapped_column(String(20), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    location: Mapped[Optional[str]] = mapped_column(String(500))
    timezone: Mapped[str] = mapped_column(String(50))
    
    lines: Mapped[List["ProductionLine"]] = relationship("ProductionLine", back_populates="plant")


class ProductionLine(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "asset_production_lines"
    __table_args__ = (UniqueConstraint('plant_id', 'line_code', name='uq_lines_plant_code'),)
    
    plant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_plants.id"))
    line_code: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(200))

    plant: Mapped["Plant"] = relationship("Plant", back_populates="lines")
    machines: Mapped[List["Machine"]] = relationship("Machine", back_populates="line")


class Machine(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "asset_machines"
    __table_args__ = (UniqueConstraint('production_line_id', 'machine_code', name='uq_machines_line_code'),)
    
    production_line_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_production_lines.id"))
    machine_code: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(200))
    machine_type: Mapped[str] = mapped_column(String(50)) # FOURDRINIER, GAP_FORMER, TWIN_WIRE
    max_speed_mpm: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    max_width_mm: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    opc_ua_endpoint: Mapped[Optional[str]] = mapped_column(String(500))

    line: Mapped["ProductionLine"] = relationship("ProductionLine", back_populates="machines")
    sections: Mapped[List["MachineSection"]] = relationship("MachineSection", back_populates="machine")


class MachineSection(Base, UUIDMixin, SoftDeleteMixin):
    __tablename__ = "asset_machine_sections"
    
    machine_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset_machines.id"))
    section_code: Mapped[str] = mapped_column(String(30)) # HEADBOX, PRESS, DRYER, CALENDER, REEL, QCS
    name: Mapped[str] = mapped_column(String(100))
    display_order: Mapped[int] = mapped_column(Integer)

    machine: Mapped["Machine"] = relationship("Machine", back_populates="sections")
