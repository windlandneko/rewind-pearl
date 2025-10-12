# 再见珍珠 (Rewind Pearl)

<div align="center">

**一款拥有时间回溯机制的 2D 平台解谜游戏**

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 项目简介

**再见珍珠 (Rewind Pearl)** 是一款使用纯 JavaScript 从零构建的 2D 平台解谜游戏，结合了平台跳跃、视觉小说对话系统和独特的时间回溯机制。游戏采用完全原创的游戏引擎，无任何第三方游戏框架依赖。

### 核心特性

- **纯 JavaScript 游戏引擎** - 从零实现的 2D 游戏引擎，采用双循环架构（逻辑帧 120 FPS + 可变渲染帧率）
- **时间回溯系统** - 独特的时间旅行机制，可回溯最多 30 秒的游戏进度
- **双风格对话系统** - 支持现代视觉小说风格和东方 Project 气泡对话风格
- **关卡编辑器** - 内置可视化关卡编辑器，支持导入导出
- **成就系统** - 完整的成就追踪和展示系统
- **存档管理** - 自动存档和手动存档功能
- **音效音乐** - 完整的背景音乐和音效系统
- **幽灵回放** - 时间回溯后的历史动作回放

### 技术架构

#### 核心系统

- **双循环架构** (`game/script/game2d/Game2D.js`)
  - 逻辑循环：固定 120 FPS 通过 `setInterval` 实现
  - 渲染循环：可变帧率通过 `requestAnimationFrame` 实现
  - 确保物理模拟的一致性，不受显示刷新率影响

- **单例模式管理器**
  - 资源管理 (`Asset.js`)
  - 对话系统 (`Dialogue.js`)
  - 音效管理 (`SoundManager.js`)
  - 键盘输入 (`Keyboard.js`)
  - 时间回溯 (`TimeTravel.js`)
  - 暂停管理 (`PauseManager.js`)
  - 成就管理 (`AchievementManager.js`)

- **游戏对象系统**
  - 所有实体继承自 `BaseObject`
  - 使用 `Vec2` 进行位置和速度管理
  - 实现 `state` getter/setter 支持时间回溯序列化
  - 生命周期方法：`update()`, `render()`, `interactWithPlayer()`

#### 项目结构

```
rewind-pearl/
├── game/                      # 游戏主体
│   ├── assets/               # 游戏资源
│   │   ├── manifest.json    # 资源清单
│   │   ├── audio/           # 音频文件
│   │   ├── background/      # 背景图片
│   │   ├── character/       # 角色精灵
│   │   ├── dialogue/        # 对话脚本
│   │   ├── tiles/           # 瓦片资源
│   │   └── ...
│   ├── script/              # 游戏脚本
│   │   ├── game2d/         # 2D 引擎核心
│   │   │   ├── Game2D.js   # 游戏主循环
│   │   │   ├── GameConfig.js # 游戏配置
│   │   │   ├── gameObject/  # 游戏对象
│   │   │   └── level/       # 关卡定义
│   │   ├── Asset.js        # 资源管理器
│   │   ├── Dialogue.js     # 对话系统
│   │   ├── TimeTravel.js   # 时间回溯
│   │   └── ...
│   ├── level-editor/        # 关卡编辑器
│   └── index.html          # 游戏入口
├── login/                   # 登录系统
├── achievements/            # 成就页面
├── about/                   # 关于页面
├── docs/                    # 开发文档 (Typst)
└── index.html              # 主菜单
```

### 快速开始

#### 环境要求

- 现代浏览器（Chrome、Firefox、Edge 等）
- 本地 HTTP 服务器（不支持 `file://` 协议）

#### 运行游戏

1. **克隆仓库**

   ```bash
   git clone https://github.com/windlandneko/rewind-pearl.git
   cd rewind-pearl
   ```

2. **启动本地服务器**

   使用 VS Code Live Server：
   - 安装 "Live Server" 扩展
   - 右键 `index.html` → "Open with Live Server"

   或使用 Python：

   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   或使用 Node.js：

   ```bash
   npx serve
   ```

3. **访问游戏**

   打开浏览器访问 `http://localhost:8000`（或对应端口）

#### 入口页面

- **主菜单**: `/index.html`
- **游戏主体**: `/game/index.html`
- **关卡编辑器**: `/game/level-editor/index.html`
- **用户登录**: `/login/index.html`

### 游戏操作

#### 基本操作

- **移动**: ← → 方向键或 A/D 键
- **跳跃**: ↑ 方向键、W 键或空格键
- **冲刺**: Shift 键
- **互动**: E 键
- **暂停**: Esc 键

#### 时间回溯

- **充能**: 长按 Q 键
- **激活回溯**: 长按 E 键（充能满后）

#### 调试功能（需启用调试模式）

- 在浏览器控制台执行：

  ```javascript
  localStorage.setItem('rewind-pearl-debug-mode', 'true')
  ```

- 显示碰撞箱、坐标、速度向量
- 数字键盘 Enter → 输入关卡名称快速跳转

### 开发指南

#### 添加新游戏对象

1. 在 `game/script/game2d/gameObject/` 创建新类：

   ```javascript
   import BaseObject from './BaseObject.js'
   
   export class MyObject extends BaseObject {
     constructor(x, y) {
       super(x, y)
       // 初始化
     }
     
     update(dt, game) {
       // 更新逻辑
     }
     
     render(ctx, game) {
       // 渲染
     }
     
     // 时间回溯支持
     get state() {
       return { ...super.state, myProp: this.myProp }
     }
     
     set state(data) {
       super.state = data
       this.myProp = data.myProp
     }
   }
   ```

2. 在 `game/script/game2d/gameObject/index.js` 导出

3. 在关卡中使用：

   ```javascript
   import * as GameObject from './gameObject/index.js'
   game.gameObjects.push(new GameObject.MyObject(100, 200))
   ```

#### 创建新关卡

1. 在 `game/script/game2d/level/` 创建关卡函数：

   ```javascript
   import { Vec2 } from '../Vector.js'
   
   export function MyLevel(game) {
     game.levelData = {
       introDialogue: 'my_level_intro',
       background: 'my_background',
       spawnpoint: new Vec2(100, 200),
       cameraHeight: 180,
       cameraBound: { x: 0, y: 0, width: 320, height: 180 },
       tileWidth: 160,
       tileHeight: 90
     }
     
     game.tilePalette = [/* 瓦片名称 */]
     game.tileData = [/* ASCII 地图 */]
     
     game.sound.playBGM('Home')
   }
   ```

2. 在 `game/script/game2d/level/index.js` 导出

#### 编写对话

在 `game/assets/dialogue/` 创建 JSON 文件：

```json
{
  "text_style": "modern",
  "events": [
    {
      "action": "add",
      "id": "alice",
      "key": "alice",
      "title": "Alice",
      "position": "left",
      "emotion": "normal"
    },
    {
      "action": "dialogue",
      "id": "alice",
      "content": "Hello, world!"
    }
  ]
}
```

支持的文本样式标记：`$wow:强调$`、`$shake:抖动$`

### 文档

详细的开发文档位于 `docs/` 目录（使用 Typst 编写）：

- `设计开发文档.typ` - 完整设计文档
- `对话脚本编写指南.typ` - 对话系统指南
- 各模块的详细文档（Asset、Dialogue、GameConfig 等）

### 关卡编辑器

访问 `/game/level-editor/index.html` 使用内置的可视化关卡编辑器：

- **功能**：拖放式瓦片放置、对象编辑、导入导出
- **瓦片集**：80+ 瓦片来自 Celeste 资源包
- **导出**：生成可直接使用的 JavaScript 代码

### 成就系统

在代码中触发成就：

```javascript
game.achievement.add('achievement_id')
```

成就在 `AchievementManager.js` 中定义。

### 常见问题

1. **游戏无法加载**
   - 确保使用 HTTP 服务器，不要直接打开 HTML 文件
   - 检查浏览器控制台是否有错误信息

2. **资源加载失败**
   - 检查 `game/assets/manifest.json` 中的资源路径
   - 确保所有资源文件存在

3. **时间回溯不工作**
   - 确保游戏对象实现了 `state` getter/setter
   - 检查 `MAX_SNAPSHOTS_COUNT` 配置

### 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

### 贡献者

查看 [关于页面](/about/index.html) 了解开发团队信息

---

## English

### About

**Rewind Pearl (再见珍珠)** is a 2D platformer puzzle game with time-travel mechanics, built entirely from scratch using vanilla JavaScript. The game combines platforming, visual novel-style dialogue, and a unique time-rewind system, powered by a custom-built game engine with no external game frameworks.

### Key Features

- **Pure JavaScript Game Engine** - Custom 2D engine with dual-loop architecture (120 FPS logic + variable render rate)
- **Time Rewind System** - Unique time-travel mechanic with up to 30 seconds of rewind
- **Dual Dialogue Styles** - Modern visual novel and Touhou Project-style bubble dialogues
- **Level Editor** - Built-in visual level editor with import/export
- **Achievement System** - Complete achievement tracking and display
- **Save Management** - Auto-save and manual save functionality
- **Audio System** - Full BGM and sound effects support
- **Ghost Replay** - Historical action replay after time rewind

### Technical Architecture

#### Core Systems

- **Dual-Loop Architecture** (`game/script/game2d/Game2D.js`)
  - Logic Loop: Fixed 120 FPS via `setInterval`
  - Render Loop: Variable framerate via `requestAnimationFrame`
  - Ensures consistent physics simulation regardless of display refresh rate

- **Singleton Pattern Managers**
  - Asset Management (`Asset.js`)
  - Dialogue System (`Dialogue.js`)
  - Sound Manager (`SoundManager.js`)
  - Keyboard Input (`Keyboard.js`)
  - Time Travel (`TimeTravel.js`)
  - Pause Manager (`PauseManager.js`)
  - Achievement Manager (`AchievementManager.js`)

- **Game Object System**
  - All entities inherit from `BaseObject`
  - Uses `Vec2` for position and velocity
  - Implements `state` getter/setter for time-travel serialization
  - Lifecycle methods: `update()`, `render()`, `interactWithPlayer()`

### Quick Start

#### Requirements

- Modern web browser (Chrome, Firefox, Edge, etc.)
- Local HTTP server (file:// protocol not supported)

#### Running the Game

1. **Clone the repository**

   ```bash
   git clone https://github.com/windlandneko/rewind-pearl.git
   cd rewind-pearl
   ```

2. **Start a local server**

   Using VS Code Live Server:
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

   Or using Python:

   ```bash
   # Python 3
   python -m http.server 8000
   ```

   Or using Node.js:

   ```bash
   npx serve
   ```

3. **Access the game**

   Open browser and navigate to `http://localhost:8000`

#### Entry Points

- **Main Menu**: `/index.html`
- **Game**: `/game/index.html`
- **Level Editor**: `/game/level-editor/index.html`
- **User Login**: `/login/index.html`

### Controls

#### Basic Controls

- **Move**: Arrow keys (← →) or A/D
- **Jump**: Up arrow, W, or Space
- **Dash**: Shift
- **Interact**: E
- **Pause**: Esc

#### Time Rewind

- **Charge**: Hold Q
- **Activate Rewind**: Hold E (when fully charged)

#### Debug Mode (requires enabling)

- Execute in browser console:

  ```javascript
  localStorage.setItem('rewind-pearl-debug-mode', 'true')
  ```

- Shows collision boxes, coordinates, velocity vectors
- Numpad Enter → type level name for quick jump

### Development Guide

#### Adding New Game Objects

1. Create new class in `game/script/game2d/gameObject/`:

   ```javascript
   import BaseObject from './BaseObject.js'
   
   export class MyObject extends BaseObject {
     constructor(x, y) {
       super(x, y)
       // Initialize
     }
     
     update(dt, game) {
       // Update logic
     }
     
     render(ctx, game) {
       // Rendering
     }
     
     // Time-travel support
     get state() {
       return { ...super.state, myProp: this.myProp }
     }
     
     set state(data) {
       super.state = data
       this.myProp = data.myProp
     }
   }
   ```

2. Export in `game/script/game2d/gameObject/index.js`

3. Use in levels:

   ```javascript
   import * as GameObject from './gameObject/index.js'
   game.gameObjects.push(new GameObject.MyObject(100, 200))
   ```

#### Creating New Levels

1. Create level function in `game/script/game2d/level/`:

   ```javascript
   import { Vec2 } from '../Vector.js'
   
   export function MyLevel(game) {
     game.levelData = {
       introDialogue: 'my_level_intro',
       background: 'my_background',
       spawnpoint: new Vec2(100, 200),
       cameraHeight: 180,
       cameraBound: { x: 0, y: 0, width: 320, height: 180 },
       tileWidth: 160,
       tileHeight: 90
     }
     
     game.tilePalette = [/* tile names */]
     game.tileData = [/* ASCII map */]
     
     game.sound.playBGM('Home')
   }
   ```

2. Export in `game/script/game2d/level/index.js`

#### Writing Dialogue

Create JSON file in `game/assets/dialogue/`:

```json
{
  "text_style": "modern",
  "events": [
    {
      "action": "add",
      "id": "alice",
      "key": "alice",
      "title": "Alice",
      "position": "left",
      "emotion": "normal"
    },
    {
      "action": "dialogue",
      "id": "alice",
      "content": "Hello, world!"
    }
  ]
}
```

Supported text markup: `$wow:emphasized$`, `$shake:animated$`

### Documentation

Detailed documentation in `docs/` directory (written in Typst):

- `设计开发文档.typ` - Complete design document
- `对话脚本编写指南.typ` - Dialogue system guide
- Module-specific docs (Asset, Dialogue, GameConfig, etc.)

### Level Editor

Access the built-in visual level editor at `/game/level-editor/index.html`:

- **Features**: Drag-and-drop tile placement, object editing, import/export
- **Tileset**: 80+ tiles from Celeste asset pack
- **Export**: Generates ready-to-use JavaScript code

### Achievement System

Trigger achievements in code:

```javascript
game.achievement.add('achievement_id')
```

Achievements are defined in `AchievementManager.js`.

### Troubleshooting

1. **Game won't load**
   - Ensure you're using an HTTP server, not opening HTML files directly
   - Check browser console for error messages

2. **Assets fail to load**
   - Verify resource paths in `game/assets/manifest.json`
   - Ensure all asset files exist

3. **Time rewind doesn't work**
   - Ensure game objects implement `state` getter/setter
   - Check `MAX_SNAPSHOTS_COUNT` configuration

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### Contributors

Visit the [About page](/about/index.html) for team information

---

<div align="center">

**Made with ❤️ using Vanilla JavaScript**

</div>
