@echo off
chcp 65001 > nul
echo ============================================================
echo    文件搜索工具 - 一键启动
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖（首次运行可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo [错误] npm install 失败！
        pause
        exit /b 1
    )
)
echo [OK] 依赖检查完成
echo.

echo [2/4] 启动后端服务器...
echo    后端将监听 http://localhost:3001
echo    请在新窗口中查看后端日志
echo.
start "文件搜索工具-后端服务器" cmd /k "npm run server:dev"

echo 等待后端服务器启动...
timeout /t 3 /nobreak > nul

echo [3/4] 启动前端服务器...
echo    前端将监听 http://localhost:5173
echo.
start "文件搜索工具-前端" cmd /k "npm run dev"

echo [4/4] 完成！
echo.
echo ============================================================
echo    启动完成！
echo ============================================================
echo.
echo 请在浏览器中打开：
echo   http://localhost:5173/file-search
echo.
echo 提示：
echo   - 保持这两个终端窗口打开
echo   - 按 Ctrl+C 可以停止服务器
echo   - 关闭此窗口不会停止服务器
echo.
pause
