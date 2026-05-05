$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================"
Write-Host " TaskFlow V8 - Auto Update"
Write-Host "============================================"
Write-Host ""

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$Icon = Join-Path $Root "Taskflow.ico"
$Release = Join-Path $Root "release\TaskFlow_V8"
$FrontendDistSource = Join-Path $Frontend "dist"
$FrontendDistTarget = Join-Path $Backend "frontend_dist"
$Launcher = Join-Path $Backend "run_taskflow_v8.py"

if (!(Test-Path $Backend)) { throw "Pasta backend nao encontrada: $Backend" }
if (!(Test-Path $Frontend)) { throw "Pasta frontend nao encontrada: $Frontend" }
if (!(Test-Path $Launcher)) { throw "Arquivo backend\run_taskflow_v8.py nao encontrado." }

Set-Location $Backend

if (!(Test-Path ".venv")) {
    python -m venv .venv
}

$Py = Join-Path $Backend ".venv\Scripts\python.exe"
$PyInstallerExe = Join-Path $Backend ".venv\Scripts\pyinstaller.exe"

& $Py -m pip install --upgrade pip
& $Py -m pip install -r requirements.txt
& $Py -m pip install --upgrade pyinstaller uvicorn fastapi passlib bcrypt python-dotenv pywebview

Set-Location $Frontend

if (!(Test-Path "node_modules")) {
    npm install
}

npm run build

if (Test-Path $FrontendDistTarget) {
    Remove-Item $FrontendDistTarget -Recurse -Force
}

Copy-Item $FrontendDistSource $FrontendDistTarget -Recurse -Force

Set-Location $Backend

if (Test-Path "build") { Remove-Item "build" -Recurse -Force }
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path "TaskFlow.spec") { Remove-Item "TaskFlow.spec" -Force }

$Args = @(
    "--onefile",
    "--noconsole",
    "--name", "TaskFlow",
    "--add-data", "app;app",
    "--add-data", "frontend_dist;frontend_dist",

    "--hidden-import", "passlib.handlers.pbkdf2",
    "--hidden-import", "passlib.handlers.bcrypt",
    "--hidden-import", "passlib.handlers.sha2_crypt",
    "--hidden-import", "passlib.handlers.des_crypt",
    "--hidden-import", "passlib.handlers.md5_crypt",
    "--hidden-import", "passlib.handlers.digests",
    "--hidden-import", "bcrypt",
    "--hidden-import", "dotenv",
    "--hidden-import", "webview",
    "--hidden-import", "webview.platforms.edgechromium",
    "--hidden-import", "webview.platforms.winforms"
)

if (Test-Path "taskflow.db") {
    $Args += @("--add-data", "taskflow.db;.")
}

if (Test-Path $Icon) {
    $Args += @("--icon", $Icon)
}

$Args += @("run_taskflow_v8.py")

& $PyInstallerExe @Args

if (!(Test-Path (Join-Path $Backend "dist\TaskFlow.exe"))) {
    throw "Executavel nao encontrado em backend\dist\TaskFlow.exe"
}

if (Test-Path $Release) {
    Remove-Item $Release -Recurse -Force
}

New-Item -ItemType Directory -Path $Release | Out-Null

Copy-Item (Join-Path $Backend "dist\TaskFlow.exe") (Join-Path $Release "TaskFlow.exe") -Force

if (Test-Path (Join-Path $Backend "taskflow.db")) {
    Copy-Item (Join-Path $Backend "taskflow.db") (Join-Path $Release "taskflow.db") -Force
}

Write-Host ""
Write-Host "BUILD V8 FINALIZADO COM SUCESSO"
Write-Host "$Release\TaskFlow.exe"
Write-Host ""