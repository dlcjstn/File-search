@echo off
cd /d "%~dp0"
echo ================================================
echo File Search Tool - Build Script
echo ================================================
echo.

echo Cleaning old files...
echo.

if exist "dist" rd /s /q "dist"
if exist "dist-electron" rd /s /q "dist-electron"
if exist "nd" rd /s /q "nd"

echo Building frontend and Electron main process...
echo.

call npm run build
call npm run electron:compile

if exist "dist-electron\main.cjs" (
    echo.
    echo Packaging application...
    echo.
    
    if exist "D:\SoloAppEnd" rd /s /q "D:\SoloAppEnd"
    
    call npx electron-builder --win --dir
    
    echo.
    echo ================================================
    echo Build completed!
    echo.
    
    if exist "nd\win-unpacked\文件搜索工具.exe" (
        echo SUCCESS: Application built!
        echo.
        echo Application location:
        echo %~dp0nd\win-unpacked\文件搜索工具.exe
        echo.
        echo You can run this exe file to start the application
        echo.
        pause
    ) else (
        echo WARNING: Build process may have issues
        echo Please check the output log above
        echo.
        pause
    )
) else (
    echo ERROR: Electron main process build failed
    echo.
    pause
)
