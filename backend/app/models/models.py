from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="ANALISTA")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="responsible_user")
    updates = relationship("TaskUpdate", back_populates="user")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    task_type: Mapped[str] = mapped_column(String(60), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="MEDIA")
    status: Mapped[str] = mapped_column(String(30), default="NOVA")
    requester: Mapped[str | None] = mapped_column(String(120), nullable=True)
    marca: Mapped[str | None] = mapped_column(String(120), nullable=True)
    request_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    due_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    blocking_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    waiting_since: Mapped[str | None] = mapped_column(String(20), nullable=True)
    observations: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    responsible_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    blocking_department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)

    responsible_user = relationship("User", foreign_keys=[responsible_id], back_populates="tasks")
    department = relationship("Department", foreign_keys=[department_id])
    blocking_department = relationship("Department", foreign_keys=[blocking_department_id])
    updates = relationship("TaskUpdate", back_populates="task", cascade="all, delete-orphan")


class TaskUpdate(Base):
    __tablename__ = "task_updates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    old_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    new_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="updates")
    user = relationship("User", back_populates="updates")
