import os
import sys
import shutil
import socket
import threading
import time
import logging
import json
import urllib.request
import subprocess
from pathlib import Path

import uvicorn
import webview
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


APP_TITLE = "TaskFlow"
APP_VERSION = "8.0.0"
PORT = int(os.environ.get("TASKFLOW_PORT", "8000"))
HOST = os.environ.get("TASKFLOW_HOST", "127.0.0.1")
URL = f"http://127.0.0.1:{PORT}"

# Coloque aqui a URL real do seu update_manifest.json
UPDATE_MANIFEST_URL = os.environ.get("TASKFLOW_UPDATE_MANIFEST_URL", "")

WINDOW_WIDTH = 1600
WINDOW_HEIGHT = 900


def resource_path(relative_path: str) -> Path:
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / relative_path
    return Path(__file__).resolve().parent / relative_path


def appdata_root() -> Path:
    local = os.environ.get("LOCALAPPDATA")
    if local:
        return Path(local) / "TaskFlowV4"
    return Path.home() / "AppData" / "Local" / "TaskFlowV4"


APPDATA_DIR = appdata_root()
DATA_DIR = APPDATA_DIR / "data"
LOG_DIR = APPDATA_DIR / "logs"
UPDATE_DIR = APPDATA_DIR / "updates"
DB_PATH = DATA_DIR / "taskflow.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)
UPDATE_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "taskflow_v8_auto_update.log"

logging.basicConfig(
    filename=str(LOG_FILE),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


def version_tuple(v: str):
    return tuple(int(x) for x in v.strip().split(".") if x.isdigit())


def is_newer_version(remote: str, current: str) -> bool:
    try:
        return version_tuple(remote) > version_tuple(current)
    except Exception:
        return False


def download_file(url: str, target: Path):
    with urllib.request.urlopen(url, timeout=30) as response:
        target.write_bytes(response.read())


def check_for_update():
    if not UPDATE_MANIFEST_URL:
        logging.info("Auto update sem URL configurada.")
        return

    try:
        logging.info("Verificando atualizacao em %s", UPDATE_MANIFEST_URL)

        with urllib.request.urlopen(UPDATE_MANIFEST_URL, timeout=15) as response:
            manifest = json.loads(response.read().decode("utf-8"))

        latest = manifest.get("latest_version", "")
        download_url = manifest.get("download_url", "")

        if not latest or not download_url:
            logging.warning("Manifesto invalido.")
            return

        if not is_newer_version(latest, APP_VERSION):
            logging.info("Nenhuma atualizacao disponivel. Atual=%s Remota=%s", APP_VERSION, latest)
            return

        installer_path = UPDATE_DIR / f"TaskFlow_Setup_{latest}.exe"
        logging.info("Nova versao encontrada: %s", latest)

        download_file(download_url, installer_path)
        logging.info("Instalador baixado: %s", installer_path)

        subprocess.Popen([str(installer_path), "/VERYSILENT", "/NORESTART"], shell=False)

        # Fecha o app atual para liberar atualização.
        os._exit(0)

    except Exception:
        logging.exception("Falha ao verificar/baixar atualizacao.")


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
            return


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


def run_server():
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_config=None,
        access_log=False,
    )


def start_desktop_window():
    window = webview.create_window(
        title=f"{APP_TITLE} v{APP_VERSION}",
        url=URL,
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        min_size=(1280, 720),
        resizable=True,
        confirm_close=False,
    )
    webview.start()


if __name__ == "__main__":
    # Verifica update em segundo plano para não travar abertura do app.
    threading.Thread(target=check_for_update, daemon=True).start()

    already_running = is_port_in_use(PORT)

    if not already_running:
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()

        if not wait_for_server(PORT):
            raise RuntimeError(f"Servidor nao iniciou na porta {PORT}")

    start_desktop_window()