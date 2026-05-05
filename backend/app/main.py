from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.models import Department, Task, User, TaskUpdate
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.departments import router as departments_router
from app.routes.tasks import router as tasks_router
from app.routes.dashboard import router as dashboard_router
from app.routes.export import router as export_router

app = FastAPI(title="TaskFlow BI & Tecnologia V2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(departments_router)
app.include_router(tasks_router)
app.include_router(dashboard_router)
app.include_router(export_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "v2"}


def seed_data():
    db = SessionLocal()
    try:
        if not db.query(User).first():
            users = [
                User(name="Robertson Romano", email="admin@taskflow.local", password_hash=get_password_hash("Admin@123"), role="GESTOR", active=True),
                User(name="Analista SAP", email="sap@taskflow.local", password_hash=get_password_hash("123456"), role="ANALISTA", active=True),
                User(name="Analista BI", email="bi@taskflow.local", password_hash=get_password_hash("123456"), role="ANALISTA", active=True),
                User(name="Analista Banco/Dashboard", email="dados@taskflow.local", password_hash=get_password_hash("123456"), role="ANALISTA", active=True),
            ]
            db.add_all(users)
            db.commit()

        if not db.query(Department).first():
            departments = [
                Department(name="SAP", description="Demandas do SAP"),
                Department(name="BI e Planilhas", description="Demandas de BI, Excel e automações"),
                Department(name="Banco de Dados e Dashboards", description="Dados, integrações e dashboards"),
                Department(name="Comercial", description="Área externa"),
                Department(name="Financeiro", description="Área externa"),
                Department(name="Diretoria", description="Demandas da Diretoria"),
            ]
            db.add_all(departments)
            db.commit()
        else:
            # Garante departamentos adicionados após o seed inicial
            for name, desc in [("Diretoria", "Demandas da Diretoria")]:
                if not db.query(Department).filter(Department.name == name).first():
                    db.add(Department(name=name, description=desc))
            db.commit()

        if not db.query(Task).first():
            task = Task(
                title="Atualização da tabela de preço do Bar Mané",
                description="Ajustar tabela com nova política comercial e validar impacto no BI.",
                task_type="BI",
                priority="ALTA",
                status="BLOQUEADA",
                requester="Gerência Comercial",
                due_date="2026-04-25",
                responsible_id=3,
                department_id=2,
                blocking_department_id=4,
                blocking_reason="Aguardando aprovação da tabela de preço pelo Comercial.",
                waiting_since="2026-04-21",
                observations="Sem o aval do Comercial não é possível concluir a publicação.",
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            db.add(TaskUpdate(task_id=task.id, user_id=1, comment="Demanda criada no seed inicial", new_status=task.status))
            db.commit()
    finally:
        db.close()


Base.metadata.create_all(bind=engine)

# Adiciona colunas novas em banco existente sem apagar dados
from sqlalchemy import text
with engine.connect() as _conn:
    for _stmt in [
        "ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT 0",
        "ALTER TABLE tasks ADD COLUMN marca VARCHAR(120)",
        "ALTER TABLE tasks ADD COLUMN request_date VARCHAR(20)",
    ]:
        try:
            _conn.execute(text(_stmt))
            _conn.commit()
        except Exception:
            pass

seed_data()
