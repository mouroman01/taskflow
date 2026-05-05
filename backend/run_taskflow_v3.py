import sys
import threading
import time
import webbrowser
from pathlib import Path

import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


def resource_path(relative_path: str) -> Path:
    """
    Resolve caminhos tanto em modo desenvolvimento quanto dentro do .exe PyInstaller.
    """
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / relative_path
    return Path(__file__).resolve().parent / relative_path


try:
    from app.main import app
except Exception as exc:
    print("ERRO AO IMPORTAR app.main:app")
    print("Verifique se o arquivo backend/app/main.py existe e se a variavel FastAPI se chama 'app'.")
    print(f"Erro: {exc}")
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
    print("AVISO: frontend_dist nao encontrado. A API vai iniciar, mas o frontend pode nao abrir.")


def open_browser():
    time.sleep(2)
    webbrowser.open("http://127.0.0.1:8000")


if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")