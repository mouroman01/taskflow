#define MyAppName "TaskFlow"
#define MyAppVersion "7.0"
#define MyAppPublisher "Robertson Romano"
#define MyAppExeName "TaskFlow.exe"

[Setup]
AppId={{B7621C1D-7EF6-4F61-92E7-000000000007}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\TaskFlow
DefaultGroupName=TaskFlow
DisableProgramGroupPage=yes
OutputDir=installer_output
OutputBaseFilename=TaskFlowV7_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
SetupIconFile=Taskflow.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Área de Trabalho"; GroupDescription: "Atalhos:"; Flags: checkedonce

[Files]
Source: "release\TaskFlow_V7\TaskFlow.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "release\TaskFlow_V7\taskflow.db"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "Taskflow.ico"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "ENCERRAR_TASKFLOW_V7.bat"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "BACKUP_BANCO_TASKFLOW_V4.bat"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "README_TASKFLOW_V7_DESKTOP_APP.md"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\TaskFlow"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\Taskflow.ico"
Name: "{group}\Encerrar TaskFlow"; Filename: "{app}\ENCERRAR_TASKFLOW_V7.bat"
Name: "{group}\Backup Banco TaskFlow"; Filename: "{app}\BACKUP_BANCO_TASKFLOW_V4.bat"
Name: "{group}\Desinstalar TaskFlow"; Filename: "{uninstallexe}"
Name: "{autodesktop}\TaskFlow"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\Taskflow.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Iniciar TaskFlow agora"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"