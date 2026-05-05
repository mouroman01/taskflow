# TaskFlow V8 — Auto Update

Esta V8 prepara o TaskFlow para atualização automática.

## O que ela faz

- Mantém o nome TaskFlow
- Mantém banco em AppData
- Adiciona verificação de nova versão
- Se houver nova versão, baixa o instalador
- Executa o instalador automaticamente
- Fecha o app atual para permitir atualização

## Como funciona

O sistema consulta um arquivo remoto chamado:

```text
update_manifest.json
```

Exemplo:

```json
{
  "latest_version": "8.1.0",
  "download_url": "https://seusite.com/downloads/TaskFlow_Setup.exe",
  "notes": "Correções e melhorias"
}
```

## Importante

Para auto update real, você precisa hospedar o instalador e o `update_manifest.json` em algum lugar, como:

- GitHub Releases
- servidor interno
- site próprio
- Google Drive com link direto
- storage/S3

## Arquivos incluídos

Copie para a raiz:

```text
C:\Projetos\taskflow_v2
```

Arquivos:

```text
BUILD_TASKFLOW_V8.ps1
GERAR_EXECUTAVEL_V8.bat
GERAR_INSTALADOR_V8.bat
TaskFlow_V8_Setup.iss
ENCERRAR_TASKFLOW_V8.bat
update_manifest_exemplo.json
```

Copie também:

```text
backend\run_taskflow_v8.py
```

para:

```text
C:\Projetos\taskflow_v2\backend\run_taskflow_v8.py
```

## Configurar a URL do update

No arquivo:

```text
backend\run_taskflow_v8.py
```

altere:

```python
UPDATE_MANIFEST_URL = ""
```

para a URL real do seu manifesto.

## Como gerar

```text
GERAR_EXECUTAVEL_V8.bat
GERAR_INSTALADOR_V8.bat
```

## Resultado

```text
release\TaskFlow_V8\TaskFlow.exe
installer_output\TaskFlowV8_Setup.exe
```