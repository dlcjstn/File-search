#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('============================================================');
console.log('🚀 文件搜索工具 - 快速启动脚本');
console.log('============================================================');
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function startServer() {
  console.log('正在启动后端服务器...');

  const serverProcess = spawn('npx', ['tsx', 'server/search-server.ts'], {
    stdio: 'pipe',
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    if (output.includes('文件搜索服务器启动成功') || output.includes('File search server running')) {
      console.log('');
      console.log('✅ 后端服务器启动成功！');
      console.log('');

      startFrontend();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('服务器错误:', data.toString());
  });

  serverProcess.on('close', (code) => {
    console.log(`服务器进程退出，代码: ${code}`);
    rl.close();
  });
}

function startFrontend() {
  console.log('正在启动前端开发服务器...');

  const frontendProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    if (output.includes('Local:') || output.includes('ready')) {
      console.log('');
      console.log('============================================================');
      console.log('✅ 启动完成！');
      console.log('');
      console.log('请在浏览器中打开:');
      console.log('  http://localhost:5173/file-search');
      console.log('');
      console.log('按 Ctrl+C 停止服务器');
      console.log('============================================================');
    }
  });

  frontendProcess.stderr.on('data', (data) => {
    console.error('前端错误:', data.toString());
  });

  frontendProcess.on('close', (code) => {
    console.log(`前端进程退出，代码: ${code}`);
    serverProcess.kill();
    rl.close();
    process.exit();
  });
}

async function main() {
  const answer = await askQuestion('是否启动文件搜索工具? (y/n): ');

  if (answer === 'y' || answer === 'yes' || answer === '') {
    await startServer();
  } else {
    console.log('已取消启动');
    rl.close();
  }
}

main().catch(console.error);
