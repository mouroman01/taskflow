import os
import sys
import shutil
import socket
import threading
import time
import logging
from pathlib import Path

import uvicorn
import webview
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


APP_TITLE = "TaskFlow"
APP_NAME = "TaskFlow"
PORT = int(os.environ.get("TASKFLOW_PORT", "8000"))
HOST = os.environ.get("TASKFLOW_HOST", "127.0.0.1")
URL = f"http://127.0.0.1:{PORT}"


def resource_path(relative_path: str) -> Path:
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / relative_path
    return Path(__file__).resolve().parent / relative_path


def appdata_root() -> Path:
    local = os.environ.get("LOCALAPPDATA")
    if local:
        # Mantém o mesmo caminho da V4/V6 para preservar o banco existente.
        return Path(local) / "TaskFlowV4"
    return Path.home() / "AppData" / "Local" / "TaskFlowV4"


APPDATA_DIR = appdata_root()
DATA_DIR = APPDATA_DIR / "data"
LOG_DIR = APPDATA_DIR / "logs"
DB_PATH = DATA_DIR / "taskflow.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "taskflow_v7_desktop.log"

logging.basicConfig(
    filename=str(LOG_FILE),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logging.info("Iniciando TaskFlow V7 Desktop App")


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def wait_for_server(port: int, timeout_seconds: int = 20) -> bool:
    start = time.time()
    while time.time() - start < timeout_seconds:
        if is_port_in_use(port):
            return True
        time.sleep(0.3)
    return False


def copy_initial_database():
    if DB_PATH.exists():
        logging.info("Banco AppData ja existe: %s", DB_PATH)
        return

    candidates = [
        resource_path("taskflow.db"),
        Path.cwd() / "taskflow.db",
        Path(__file__).resolve().parent / "taskflow.db",
        Path(__file__).resolve().parent.parent / "taskflow.db",
    ]

    for candidate in candidates:
        if candidate.exists():
            shutil.copy2(candidate, DB_PATH)
            logging.info("Banco inicial copiado de %s para %s", candidate, DB_PATH)
            return

    logging.warning("Nenhum banco inicial encontrado.")


copy_initial_database()

os.environ["TASKFLOW_DB_PATH"] = str(DB_PATH)
os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH.as_posix()}"
os.environ["SQLALCHEMY_DATABASE_URL"] = f"sqlite:///{DB_PATH.as_posix()}"

try:
    from app.main import app
except Exception:
    logging.exception("Erro ao importar app.main:app")
    raise


frontend_dir = resource_path("frontend_dist")
index_file = frontend_dir / "index.html"

if frontend_dir.exists() and index_file.exists():
    assets_dir = frontend_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_frontend_root():
        return FileResponse(str(index_file))

    @app.get("/{full_path:path}")
    async def serve_frontend_spa(full_path: str):
        requested = frontend_dir / full_path
        if requested.exists() and requested.is_file():
            return FileResponse(str(requested))
        return FileResponse(str(index_file))
else:
    logging.warning("frontend_dist nao encontrado")


def run_server():
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_config=None,
        access_log=False,
    )


def start_desktop_window():
    webview.create_window(
        title=APP_TITLE,
        url=URL,
        width=1280,
        height=800,
        min_size=(1024, 650),
        confirm_close=False,
    )
    webview.start()


if __name__ == "__main__":
    already_running = is_port_in_use(PORT)

    if not already_running:
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()

        if not wait_for_server(PORT):
            logging.error("Servidor nao iniciou na porta %s", PORT)
            raise RuntimeError(f"Servidor nao iniciou na porta {PORT}")

    start_desktop_window()