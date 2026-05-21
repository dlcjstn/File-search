@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 检查打包文件完整性
echo ========================================
echo.

echo 检查必要文件是否存在...
echo.

set files[0]=ffmpeg.dll
set files[1]=d3dcompiler_47.dll
set files[2]=icudtl.dat
set files[3]=libEGL.dll
set files[4]=libGLESv2.dll
set files[5]=resources.pak
set files[6]=文件搜索工具.exe

echo 文件检查结果:
for %%f in (ffmpeg.dll d3dcompiler_47.dll icudtl.dat libEGL.dll libGLESv2.dll resources.pak 文件搜索工具.exe) do (
    if exist "%%f" (
        for %%A in ("%%f") do echo   [✓] %%~nxA - 存在
    ) else (
        echo   [✗] %%f - 缺失
    )
)

echo.
echo ========================================
echo 检查完成
echo ========================================
pause
