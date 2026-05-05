# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['run_taskflow_v3.py'],
    pathex=[],
    binaries=[],
    datas=[('app', 'app'), ('frontend_dist', 'frontend_dist'), ('taskflow.db', '.')],
    hiddenimports=['passlib.handlers.pbkdf2', 'passlib.handlers.bcrypt', 'passlib.handlers.sha2_crypt', 'passlib.handlers.des_crypt', 'passlib.handlers.md5_crypt', 'passlib.handlers.digests', 'bcrypt'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='TaskFlowV3',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['C:\\Projetos\\taskflow_v2\\Taskflow.ico'],
)
