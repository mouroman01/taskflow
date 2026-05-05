# TaskFlow V5 — Instalador Profissional

Esta V5 prepara o TaskFlow para virar um programa instalável no Windows.

## O que esta versão entrega

- Script para gerar instalador `.exe`
- Atalho no Menu Iniciar
- Atalho na Área de Trabalho
- Desinstalador automático
- Banco preservado em AppData
- Executável principal `TaskFlowV4.exe` empacotado no instalador

## Pré-requisito

Instale o Inno Setup no Windows:

https://jrsoftware.org/isinfo.php

Depois de instalar, o compilador normalmente fica em:

```text
C:\Program Files (x86)\Inno Setup 6\ISCC.exe
```

## Antes de gerar o instalador

Você precisa já ter gerado a V4:

```text
release\TaskFlow_V4\TaskFlowV4.exe
```

Se ainda não existir, execute primeiro:

```text
GERAR_EXECUTAVEL_V4.bat
```

## Como gerar o instalador

Na raiz do projeto, execute:

```text
GERAR_INSTALADOR_V5.bat
```

## Resultado final

O instalador será criado em:

```text
installer_output\TaskFlowV5_Setup.exe
```

## Banco de dados

A V5 mantém o banco em:

```text
%LOCALAPPDATA%\TaskFlowV4\data\taskflow.db
```

Isso significa que atualizar o programa não apaga os dados.