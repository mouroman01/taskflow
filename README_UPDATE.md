# TaskFlow - Auto Update

## Como funciona
O sistema consulta o arquivo `update_manifest.json` neste repositório.

## IMPORTANTE
Este repositório é privado. Para o auto update funcionar externamente, você deve:

1. Tornar este repositório público
OU
2. Criar um repositório público separado apenas para updates
OU
3. Hospedar o manifest em um servidor acessível

## Padrão de release
1. Gere nova versão (ex: 8.0.1)
2. Suba o instalador em Releases
3. Atualize `update_manifest.json`

## Exemplo
```
{
  "latest_version": "8.0.1",
  "download_url": "https://github.com/SEUUSUARIO/taskflow/releases/download/v8.0.1/TaskFlowV8_Setup.exe"
}
```
