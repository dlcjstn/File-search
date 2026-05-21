@echo off
cd /d "%~dp0"
echo Building application...
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
    echo Build completed!
    echo.
    
    if exist "nd\win-unpacked\文件搜索工具.exe" (
        echo SUCCESS: Application built!
        echo Location: %~dp0nd\win-unpacked\文件搜索工具.exe
        pause
    ) else (
        echo ERROR: Build failed
        pause
    )
) else (
    echo ERROR: Electron build failed
    pause
)
