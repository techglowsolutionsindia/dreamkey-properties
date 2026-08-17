@echo off
setlocal
cd /d "%~dp0"

echo ==================================================
echo  DreamKey Properties - Excel to Website Export
echo ==================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\export-properties.ps1"

if errorlevel 1 (
  echo.
  echo EXPORT FAILED.
  echo Please check the error message above.
  pause
  exit /b 1
)

echo.
echo Done. Refresh your website in the browser.
pause
