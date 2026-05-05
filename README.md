<<<<<<< HEAD
# TaskFlow V2

V2 do sistema de gestão de demandas da equipe de BI & Tecnologia.

## Novidades da V2
- login real no frontend
- sessão com token JWT
- tela de detalhe da demanda
- histórico visível na interface
- edição de demandas no frontend
- botão para esconder o menu lateral
- backend ajustado para evitar o problema de bcrypt

## Stack
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React + Vite + Recharts
- Auth: JWT

## Credenciais iniciais
- Gestor: `admin@taskflow.local` / `Admin@123`
- SAP: `sap@taskflow.local` / `123456`
- BI: `bi@taskflow.local` / `123456`
- Dados: `dados@taskflow.local` / `123456`

## Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend
Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Acesso
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Docs API: `http://localhost:8000/docs`

## Observação importante
Se você já rodou a V1 antes, apague o arquivo `taskflow.db` da pasta `backend` antes de subir a V2, para recriar o banco limpo com as novas senhas em `pbkdf2_sha256`.
>>>>>>> 2610cec (V1 TaskFlow)
