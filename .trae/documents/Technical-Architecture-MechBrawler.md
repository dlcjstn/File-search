# 像素风机甲对战游戏 - 技术架构文档

## 1. 项目架构设计

```
┌─────────────────────────────────────────────────────┐
│                    游戏主程序                         │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 游戏引擎 │  │ 渲染器  │  │ 物理引擎 │  │ 音效引擎 │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘ │
│       │            │            │            │      │
├───────┴────────────┴────────────┴────────────┴──────┤
│                      游戏对象层                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  PlayerA │  │  PlayerB │  │  粒子系统 │  │ UI层   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────┘
```

## 2. 技术栈说明

### 核心技术
- **前端框架**：原生 HTML5 + CSS3 + JavaScript（无框架依赖）
- **渲染引擎**：HTML5 Canvas 2D Context
- **游戏循环**：requestAnimationFrame (60 FPS)
- **像素渲染**：imageSmoothingEnabled = false

### 辅助技术
- **字体加载**：Google Fonts - Press Start 2P, VT323
- **音效处理**：Web Audio API
- **输入处理**：KeyboardEvent 事件监听

## 3. 核心模块设计

### 3.1 游戏引擎 (GameEngine)

**职责**
- 管理游戏主循环
- 处理游戏状态切换
- 协调各模块更新

**核心类结构**
```javascript
class GameEngine {
  constructor(canvasId)
  start()
  pause()
  update(deltaTime)
  render()
  gameLoop(timestamp)
  handleInput(event)
}
```

### 3.2 渲染器 (Renderer)

**职责**
- 清除画布
- 绘制背景和场景
- 绘制游戏对象
- 绘制UI元素
- 处理像素完美渲染

**核心类结构**
```javascript
class Renderer {
  constructor(canvas)
  clearScreen()
  drawBackground()
  drawMech(mech)
  drawUI()
  drawParticles()
  setPixelPerfect()
}
```

### 3.3 物理引擎 (PhysicsEngine)

**职责**
- 处理重力模拟
- 边界碰撞检测
- 角色间碰撞检测
- 攻击范围检测

**核心参数**
- 重力加速度：0.5 单位/帧²
- 地面位置：canvas.height - 100
- 跳跃初速度：-12 单位/帧
- 移动速度：4-5 单位/帧

### 3.4 角色类 (Mech)

**职责**
- 管理角色状态
- 处理动画播放
- 处理输入响应
- 计算伤害判定

**状态机**
```
IDLE (待机)
  ↓
WALKING (行走) ←→ IDLE
  ↓
JUMPING (跳跃) ←→ IDLE
  ↓
ATTACKING (攻击) → HIT_STUN (受击) → IDLE
  ↓
BLOCKING (防御) → IDLE
```

**动画帧配置**
```javascript
animations: {
  idle: { frames: 4, fps: 8 },
  walk: { frames: 6, fps: 12 },
  attack1: { frames: 3, fps: 15 },
  attack2: { frames: 5, fps: 10 },
  special: { frames: 6, fps: 8 },
  hurt: { frames: 3, fps: 20 },
  block: { frames: 2, fps: 10 }
}
```

### 3.5 粒子系统 (ParticleSystem)

**职责**
- 管理粒子生命周期
- 渲染攻击特效
- 渲染防御护盾
- 渲染受伤效果

**粒子类型**
```javascript
particleTypes: {
  spark: { color: '#ffff00', size: 3, life: 20 },
  shield: { color: '#00d9ff', size: 5, life: 30 },
  blood: { color: '#ff4757', size: 4, life: 25 }
}
```

## 4. 数据结构设计

### 4.1 角色属性

```typescript
interface MechStats {
  name: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  moveSpeed: number;
  attackDamage: number;
  heavyAttackDamage: number;
  specialDamage: number;
  defenseReduction: number;
  specialCooldown: number;
}
```

### 4.2 游戏状态

```typescript
enum GameState {
  MENU = 'menu',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver'
}
```

### 4.3 角色状态

```typescript
enum MechState {
  IDLE = 'idle',
  WALKING = 'walking',
  JUMPING = 'jumping',
  ATTACKING = 'attacking',
  HEAVY_ATTACK = 'heavy_attack',
  SPECIAL = 'special',
  BLOCKING = 'blocking',
  HIT_STUN = 'hit_stun',
  DEAD = 'dead'
}
```

## 5. 输入控制系统

### 5.1 键盘映射

**玩家1 (机甲A - 蓝色)**
```
移动：W (跳跃), A (左), S (防御), D (右)
攻击：J (普通攻击), K (重攻击), L (特殊技能)
```

**玩家2 (机甲B - 红色)**
```
移动：↑ (跳跃), ← (左), ↓ (防御), → (右)
攻击：Numpad 1 (普通攻击), Numpad 2 (重攻击), Numpad 3 (特殊技能)
```

### 5.2 输入处理流程

```
键盘按下 → InputHandler → 更新输入状态 → MechController
                                    ↓
                              根据状态响应动作
                                    ↓
                              状态机状态转换
```

## 6. 渲染层级

```
Layer 0: 背景层 (静态场景 + 地面)
Layer 1: 角色层 (机甲A, 机甲B)
Layer 2: 特效层 (粒子效果, 攻击动画)
Layer 3: UI层 (血量条, 能量条, 状态信息)
Layer 4: 菜单层 (开始界面, 结束界面)
```

## 7. 动画系统

### 7.1 精灵图方案

由于没有外部素材，使用 Canvas 绘制像素机甲：

```javascript
// 机甲绘制函数
function drawPixelMech(ctx, x, y, color1, color2, direction, frame) {
  // 绘制像素化的机甲外形
  // 16x16 像素网格
  // 颜色使用 color1 和 color2
}
```

### 7.2 帧动画控制

```javascript
class AnimationController {
  constructor(animationData)
  update(deltaTime)
  getCurrentFrame()
  play(animationName)
  isFinished()
}
```

## 8. 碰撞检测系统

### 8.1 碰撞盒配置

```javascript
collisionBoxes: {
  body: { width: 40, height: 60, offset: { x: 0, y: 20 } },
  attack1: { width: 50, height: 30, offset: { x: 30, y: 30 } },
  attack2: { width: 70, height: 40, offset: { x: 40, y: 20 } },
  special: { width: 100, height: 60, offset: { x: 50, y: 10 } }
}
```

### 8.2 碰撞检测算法

使用 AABB (Axis-Aligned Bounding Box) 矩形碰撞检测：

```javascript
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}
```

## 9. 文件结构

```
mech-brawler/
├── index.html          # 主HTML文件
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── main.js         # 游戏入口
│   ├── GameEngine.js   # 游戏引擎
│   ├── Renderer.js     # 渲染器
│   ├── Physics.js      # 物理引擎
│   ├── Mech.js         # 机甲类
│   ├── ParticleSystem.js # 粒子系统
│   ├── InputHandler.js # 输入处理
│   ├── UI.js           # UI管理
│   ├── AudioManager.js # 音效管理
│   └── constants.js    # 游戏常量
└── assets/             # 素材目录（备用）
    └── fonts/          # 字体文件
```

## 10. 性能优化策略

### 10.1 渲染优化
- 仅在需要时重绘（脏矩形检测）
- 限制粒子数量（最多100个）
- 使用离屏 Canvas 预渲染静态元素

### 10.2 逻辑优化
- 使用对象池管理粒子
- 避免在游戏循环中创建对象
- 使用位运算优化碰撞检测

## 11. 扩展性设计

### 11.1 插件化架构
```javascript
class GameEngine {
  registerPlugin(plugin) {
    plugin.init(this);
    this.plugins.push(plugin);
  }
}
```

### 11.2 可配置元素
- 角色属性配置化
- 动画数据外部化
- 音效文件可替换

## 12. 浏览器兼容性

### 目标浏览器
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 必要API
- Canvas 2D
- requestAnimationFrame
- KeyboardEvent
- Web Audio API (可选)
