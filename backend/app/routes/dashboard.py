from datetime import date
from sqlalchemy import case, func
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Task, User, Department

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(
    responsible_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = db.query(Task)
    if current_user.role != "GESTOR":
        base = base.filter(Task.responsible_id == current_user.id)
    elif responsible_id:
        base = base.filter(Task.responsible_id == responsible_id)

    total_tasks = base.with_entities(func.count(Task.id)).scalar() or 0
    blocked_tasks = base.filter(Task.status.in_(["BLOQUEADA", "AGUARDANDO_TERCEIRO"])).with_entities(func.count(Task.id)).scalar() or 0
    completed_tasks = base.filter(Task.status == "CONCLUIDA").with_entities(func.count(Task.id)).scalar() or 0
    overdue_tasks = base.filter(Task.status != "CONCLUIDA", Task.due_date != None).with_entities(func.count(Task.id)).scalar() or 0

    by_status = [
        {"status": status, "count": count}
        for status, count in (
            base.with_entities(Task.status, func.count(Task.id)).group_by(Task.status).all()
        )
    ]

    by_responsible = [
        {"name": name, "count": count}
        for name, count in db.query(User.name, func.count(Task.id))
        .join(Task, Task.responsible_id == User.id)
        .group_by(User.name)
        .all()
    ]

    by_blocking_department = [
        {"name": name, "count": count}
        for name, count in (
            base.join(Department, Task.blocking_department_id == Department.id)
            .with_entities(Department.name, func.count(Task.id))
            .group_by(Department.name)
            .all()
        )
    ]

    return {
        "cards": {
            "total_tasks": total_tasks,
            "blocked_tasks": blocked_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
        },
        "by_status": by_status,
        "by_responsible": by_responsible,
        "by_blocking_department": by_blocking_department,
    }


@router.get("/pivot")
def get_pivot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = db.query(Task.status, Task.marca, func.count(Task.id).label("total"))
    if current_user.role != "GESTOR":
        base = base.filter(Task.responsible_id == current_user.id)

    rows = base.filter(Task.marca != None, Task.marca != "").group_by(Task.status, Task.marca).all()

    # Build pivot: {status -> {marca -> count}}
    pivot: dict = {}
    marcas: set = set()
    for status, marca, total in rows:
        pivot.setdefault(status, {})[marca] = total
        marcas.add(marca)

    sorted_marcas = sorted(marcas)
    result = []
    for status, counts in pivot.items():
        result.append({
            "status": status,
            "counts": {m: counts.get(m, 0) for m in sorted_marcas},
            "total": sum(counts.values()),
        })

    return {"marcas": sorted_marcas, "rows": result}


@router.get("/workload")
def get_workload(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today().isoformat()
    DONE = ["CONCLUIDA", "CANCELADA"]
    BLOCKED = ["BLOQUEADA", "AGUARDANDO_TERCEIRO"]

    query = (
        db.query(
            User.id,
            User.name,
            func.count(Task.id).label("total"),
            func.sum(case((Task.status.notin_(DONE), 1), else_=0)).label("open"),
            func.sum(case((Task.status.in_(BLOCKED), 1), else_=0)).label("blocked"),
            func.sum(case(
                (Task.status.notin_(DONE) & (Task.due_date != None) & (Task.due_date < today), 1),
                else_=0,
            )).label("overdue"),
            func.sum(case((Task.status == "CONCLUIDA", 1), else_=0)).label("completed"),
        )
        .join(Task, Task.responsible_id == User.id)
        .filter(User.active == True)
        .group_by(User.id, User.name)
    )

    if current_user.role != "GESTOR":
        query = query.filter(User.id == current_user.id)

    rows = query.order_by(func.sum(case((Task.status.notin_(DONE), 1), else_=0)).desc()).all()

    return [
        {
            "user_id": r.id,
            "name": r.name,
            "total": r.total,
            "open": r.open,
            "blocked": r.blocked,
            "overdue": r.overdue,
            "completed": r.completed,
        }
        for r in rows
    ]
