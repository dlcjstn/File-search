@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 清理旧文件并重新打包
echo ========================================
echo.

echo 正在关闭应用程序...
taskkill /F /IM "文件搜索工具.exe" 2>nul
timeout /t 2 >nul

echo.
echo 正在删除旧打包目录...
rmdir /S /Q "D:\SoloAppEnd\win-unpacked" 2>nul
timeout /t 2 >nul

echo.
echo 正在重新构建前端...
call npm run build

echo.
echo 正在打包 Electron 主进程...
call node scripts/bundle-electron.mjs

echo.
echo 正在打包应用程序...
call npx electron-builder --win --dir

echo.
echo ========================================
echo 打包完成！
echo ========================================
pause
