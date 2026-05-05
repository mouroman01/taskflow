# TaskFlow V7 — Desktop App

Esta V7 transforma o TaskFlow em um aplicativo desktop de verdade:

- Abre em janela própria, sem navegador
- Não mostra terminal
- Mantém banco persistente em AppData
- Usa o mesmo backend FastAPI + frontend React
- Usa `pywebview` para janela desktop
- Instalador atualizado

## Arquivos incluídos

Copie para a raiz:

```text
C:\Projetos\taskflow_v2
```

Arquivos:

```text
BUILD_TASKFLOW_V7.ps1
GERAR_EXECUTAVEL_V7.bat
GERAR_INSTALADOR_V7.bat
TaskFlow_V7_Setup.iss
ENCERRAR_TASKFLOW_V7.bat
README_TASKFLOW_V7_DESKTOP_APP.md
```

Copie também:

```text
backend\run_taskflow_v7.py
```

para:

```text
C:\Projetos\taskflow_v2\backend\run_taskflow_v7.py
```

## Como gerar o executável desktop

Execute:

```text
GERAR_EXECUTAVEL_V7.bat
```

Resultado:

```text
release\TaskFlow_V7\TaskFlow.exe
```

## Como gerar o instalador

Execute:

```text
GERAR_INSTALADOR_V7.bat
```

Resultado:

```text
installer_output\TaskFlowV7_Setup.exe
```

## Observação

O nome do programa continua:

```text
TaskFlow
```

O banco continua preservado em:

```text
%LOCALAPPDATA%\TaskFlowV4\data\taskflow.db
```

Foi mantido esse caminho para não perder os dados já usados nas versões V4/V5/V6.