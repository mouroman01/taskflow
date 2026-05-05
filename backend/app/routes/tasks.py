from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Task, TaskUpdate, User
from app.schemas.schemas import TaskCreate, TaskListItem, TaskOut, TaskUpdateOut, TaskUpdateRequest

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def serialize_task(task: Task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "priority": task.priority,
        "status": task.status,
        "requester": task.requester,
        "marca": task.marca,
        "request_date": task.request_date,
        "due_date": task.due_date,
        "blocking_reason": task.blocking_reason,
        "waiting_since": task.waiting_since,
        "observations": task.observations,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "responsible_id": task.responsible_id,
        "department_id": task.department_id,
        "blocking_department_id": task.blocking_department_id,
        "responsible_name": task.responsible_user.name if task.responsible_user else None,
        "department_name": task.department.name if task.department else None,
        "blocking_department_name": task.blocking_department.name if task.blocking_department else None,
    }


def serialize_update(item: TaskUpdate):
    return {
        "id": item.id,
        "comment": item.comment,
        "old_status": item.old_status,
        "new_status": item.new_status,
        "created_at": item.created_at,
        "user_id": item.user_id,
        "user_name": item.user.name if item.user else None,
    }


def _assert_task_access(task: Task, current_user: User):
    if current_user.role != "GESTOR" and task.responsible_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado a esta demanda")


@router.get("", response_model=list[TaskListItem])
def list_tasks(
    status: str | None = Query(default=None),
    responsible_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    # Non-GESTOR always see only their own tasks
    if current_user.role != "GESTOR":
        query = query.filter(Task.responsible_id == current_user.id)
    elif responsible_id:
        query = query.filter(Task.responsible_id == responsible_id)
    tasks = query.order_by(Task.updated_at.desc()).all()
    return [serialize_task(task) for task in tasks]


@router.get("/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Demanda não encontrada")
    _assert_task_access(task, current_user)
    updates = db.query(TaskUpdate).filter(TaskUpdate.task_id == task_id).order_by(TaskUpdate.created_at.desc()).all()
    return {"task": serialize_task(task), "updates": [serialize_update(item) for item in updates]}


@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.status in ["BLOQUEADA", "AGUARDANDO_TERCEIRO"] and not payload.blocking_reason:
        raise HTTPException(status_code=400, detail="Motivo do bloqueio é obrigatório")

    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)

    db.add(TaskUpdate(task_id=task.id, user_id=current_user.id, comment="Demanda criada", new_status=task.status))
    db.commit()
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Demanda não encontrada")
    _assert_task_access(task, current_user)

    old_status = task.status
    data = payload.model_dump(exclude_unset=True)
    comment = data.pop("comment", None)
    user_id = data.pop("user_id", None) or current_user.id

    new_status = data.get("status", task.status)
    if new_status in ["BLOQUEADA", "AGUARDANDO_TERCEIRO"] and not data.get("blocking_reason", task.blocking_reason):
        raise HTTPException(status_code=400, detail="Motivo do bloqueio é obrigatório")

    if new_status not in ["BLOQUEADA", "AGUARDANDO_TERCEIRO"]:
        data.setdefault("blocking_reason", None)
        data.setdefault("blocking_department_id", None)
        data.setdefault("waiting_since", None)

    for key, value in data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    if comment or old_status != task.status:
        db.add(TaskUpdate(
            task_id=task.id,
            user_id=user_id,
            comment=comment or "Demanda atualizada",
            old_status=old_status,
            new_status=task.status,
        ))
        db.commit()

    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Demanda não encontrada")
    if current_user.role != "GESTOR":
        raise HTTPException(status_code=403, detail="Somente o administrador pode excluir demandas")
    db.delete(task)
    db.commit()
    return {"ok": True}


@router.get("/{task_id}/updates", response_model=list[TaskUpdateOut])
def list_task_updates(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(TaskUpdate).filter(TaskUpdate.task_id == task_id).order_by(TaskUpdate.created_at.desc()).all()
    return [serialize_update(item) for item in items]
