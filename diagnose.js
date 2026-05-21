#!/usr/bin/env node

console.log('============================================================');
console.log('   文件搜索工具 - 诊断工具');
console.log('============================================================');
console.log('');

const http = require('http');

function checkServer(url, name, successMessage) {
  return new Promise((resolve) => {
    console.log(`检查 ${name}...`);

    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name} 运行正常`);
          try {
            console.log('   响应:', JSON.parse(data));
          } catch (e) {
            console.log('   响应:', data);
          }
          resolve(true);
        } else {
          console.log(`❌ ${name} 返回错误: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${name} 无法连接: ${err.message}`);
      resolve(false);
    });

    setTimeout(() => {
      console.log(`⏱️  ${name} 连接超时`);
      resolve(false);
    }, 5000);
  });
}

async function diagnose() {
  console.log('开始诊断...\n');

  const backendOk = await checkServer(
    'http://localhost:3001/api/health',
    '后端服务器 (localhost:3001)',
    '后端服务器运行正常'
  );

  console.log('');

  if (backendOk) {
    console.log('============================================================');
    console.log('   ✅ 诊断结果：后端服务器运行正常！');
    console.log('============================================================');
    console.log('');
    console.log('请在浏览器中打开：');
    console.log('  http://localhost:5173/file-search');
    console.log('');
    console.log('如果仍然无法搜索，请尝试：');
    console.log('  1. 刷新浏览器页面 (F5)');
    console.log('  2. 清除浏览器缓存');
    console.log('  3. 使用无痕/隐私模式打开浏览器');
  } else {
    console.log('============================================================');
    console.log('   ❌ 诊断结果：后端服务器未运行');
    console.log('============================================================');
    console.log('');
    console.log('请运行以下命令启动后端服务器：');
    console.log('');
    console.log('  npm run server:dev');
    console.log('');
    console.log('或者双击运行：');
    console.log('  启动文件搜索工具.bat');
    console.log('');
    console.log('如果后端服务器启动失败，请检查：');
    console.log('  1. 端口 3001 是否被占用');
    console.log('  2. Node.js 是否正确安装');
    console.log('  3. 依赖是否正确安装 (npm install)');
  }

  console.log('');
}

diagnose().catch(console.error);
