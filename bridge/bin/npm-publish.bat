@echo off

set DIR=%~dp0.

set npm_rootdir=%DIR%\..
set old_README="%npm_rootdir%\README.md"
set new_README="%npm_rootdir%\..\README.md"

if exist %old_README% del /F %old_README%
copy /Y %new_README% %old_README%

cd /D "%npm_rootdir%"
call npm publish --access=public

echo.
pause
