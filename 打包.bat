@echo off
chcp 65001 >nul
echo ================================================
echo 文件搜索工具 - 打包脚本
echo ================================================
echo.

echo 正在清理旧文件...
echo.

cd /d "%~dp0"

rem 删除旧的构建目录
if exist "dist" rmdir /s /q "dist"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "nd" rmdir /s /q "nd"

echo 正在构建前端和Electron主进程...
echo.

npm run build
npm run electron:compile

if exist "dist-electron\main.cjs" (
    echo.
    echo 正在打包应用程序...
    echo.
    
    if exist "D:\SoloAppEnd" rmdir /s /q "D:\SoloAppEnd"
    
    npx electron-builder --win --dir
    
    echo.
    echo ================================================
    echo 打包完成！
    echo.
    
    if exist "nd\win-unpacked\文件搜索工具.exe" (
        echo ✅ 打包成功！
        echo.
        echo 应用程序位置:
        echo %~dp0nd\win-unpacked\文件搜索工具.exe
        echo.
        echo 可以直接运行此 exe 文件启动应用程序
        echo.
        pause
    ) else (
        echo ⚠️ 打包过程可能遇到问题
        echo 请检查上方输出日志
        echo.
        pause
    )
) else (
    echo ⚠️ Electron 主进程构建失败
    echo.
    pause
)
