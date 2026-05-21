# 文件搜索工具 - 启动指南

## 问题说明

如果只能看到示例文件，说明后端服务器没有正确启动。

## 解决方案

### 方法一：一键启动（推荐）

```bash
npm install
npm run dev:all
```

这会自动同时启动：
1. **后端服务器**（端口 3001）- 负责搜索 C 盘和 D 盘
2. **前端开发服务器**（端口 5173）- 文件搜索工具界面

然后访问：http://localhost:5173/file-search

### 方法二：分步启动

如果你想分开启动，先打开**第一个终端**：

```bash
# 安装依赖（如果还没安装）
npm install

# 启动后端服务器
npm run server:dev
```

等待看到：`File search server running on http://localhost:3001`

然后打开**第二个终端**：

```bash
# 启动前端
npm run dev
```

访问：http://localhost:5173/file-search

### 方法三：Electron 桌面应用

```bash
npm install
npm run electron:build
npm run electron:start
```

## 验证服务器是否正常运行

在浏览器中打开开发者工具（F12），切换到 Console 标签页，查看搜索模式提示：

- 🚀 **Electron 模式** - 使用桌面应用，功能完整
- 🌐 **服务器模式** - 后端服务器运行中，功能完整
- 📝 **演示模式** - 只显示示例数据，后端服务器未启动

## 检查后端服务器日志

如果后端服务器已启动，你应该能看到搜索日志：

```bash
# 终端中会显示：
Searching with: { keyword: 'xxx', extensions: [...] }
Found 1234 files
```

如果没有看到这些日志，说明后端服务器没有运行。
