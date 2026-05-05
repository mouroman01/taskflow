from datetime import datetime
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class UserSummary(BaseModel):
    id: int
    name: str
    email: str
    role: str
    must_change_password: bool = False

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str | None = None
    role: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    active: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    active: bool
    must_change_password: bool = False

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str
    description: str | None = None


class DepartmentOut(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    task_type: str
    priority: str
    status: str = "NOVA"
    requester: str | None = None
    marca: str | None = None
    request_date: str | None = None
    due_date: str | None = None
    responsible_id: int | None = None
    department_id: int | None = None
    blocking_department_id: int | None = None
    blocking_reason: str | None = None
    waiting_since: str | None = None
    observations: str | None = None


class TaskUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    task_type: str | None = None
    priority: str | None = None
    status: str | None = None
    requester: str | None = None
    marca: str | None = None
    request_date: str | None = None
    due_date: str | None = None
    responsible_id: int | None = None
    department_id: int | None = None
    blocking_department_id: int | None = None
    blocking_reason: str | None = None
    waiting_since: str | None = None
    observations: str | None = None
    comment: str | None = None
    user_id: int | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None
    task_type: str
    priority: str
    status: str
    requester: str | None
    marca: str | None
    request_date: str | None
    due_date: str | None
    blocking_reason: str | None
    waiting_since: str | None
    observations: str | None
    created_at: datetime
    updated_at: datetime
    responsible_id: int | None
    department_id: int | None
    blocking_department_id: int | None

    class Config:
        from_attributes = True


class TaskListItem(BaseModel):
    id: int
    title: str
    description: str | None
    task_type: str
    priority: str
    status: str
    requester: str | None
    marca: str | None
    request_date: str | None
    due_date: str | None
    blocking_reason: str | None
    waiting_since: str | None
    observations: str | None
    created_at: datetime
    updated_at: datetime
    responsible_id: int | None
    department_id: int | None
    blocking_department_id: int | None
    responsible_name: str | None = None
    department_name: str | None = None
    blocking_department_name: str | None = None


class TaskUpdateOut(BaseModel):
    id: int
    comment: str
    old_status: str | None
    new_status: str | None
    created_at: datetime
    user_id: int | None
    user_name: str | None = None

    class Config:
        from_attributes = True
