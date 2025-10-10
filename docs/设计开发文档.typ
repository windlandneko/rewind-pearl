// ============================================================================
// 再见珍珠 - 设计开发文档
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "再见珍珠",
  subtitle: "设计开发文档",
  authors: ("windlandneko",),
)

#pagebreak()

= 项目概述

== 项目介绍

*再见珍珠（Rewind Pearl）* 是一款融合横板解谜、视觉小说和时间回溯机制的 Web 游戏。游戏以丁真为主角，通过传统的2D横板解谜、碎片化的剧情叙事、创新的时间回溯机制和多结局分支，为玩家提供独特而纯真的游戏体验。

== 技术栈

- *未使用任何第三方框架或库，完全自主开发*
- *纯原生前端*：基于 HTML5 + CSS3 + ES6 JavaScript
- *Canvas 2D 渲染*：自研高性能 2D 游戏引擎
- *模块化架构*：清晰、解耦的代码结构，易于开发和维护
- *响应式设计*：支持全部分辨率和绝大多数现代浏览器

= 项目结构

#set par(leading: 0.08em)
```
rewind-pearl/
├── .git/                   # 版本控制相关
├── .github/
├── .gitignore
├── index.html              # 主页面
├── main.js                 # 主页面逻辑（用户管理、菜单）
├── style.css               # 主页面样式
├── logo.png                # 游戏 Logo
├── background.png          # 主页背景图（PNG）
├── background.webp         # 主页背景图（WebP）
│
├── game/                   # 游戏主目录
│   ├── index.html          # 游戏页面
│   │
│   ├── script/             # 游戏脚本
│   │   ├── main.js         # 游戏入口
│   │   ├── Asset.js        # 资源管理器
│   │   ├── Dialogue.js     # 对话系统
│   │   ├── Loading.js      # 加载界面管理
│   │   ├── Keyboard.js     # 键盘输入管理
│   │   ├── SoundManager.js # 音频管理
│   │   ├── SaveManager.js  # 存档管理
│   │   ├── AchievementManager.js # 成就系统
│   │   ├── PauseManager.js # 暂停页面
│   │   ├── utils.js        # 工具函数
│   │   │
│   │   └── game2d/         # 2D 游戏引擎
│   │       ├── Game2D.js   # 核心引擎
│   │       ├── GameConfig.js # 游戏配置常量
│   │       ├── Vector.js   # 2D 向量运算
│   │       ├── Camera.js   # 摄像机系统
│   │       ├── TimeTravel.js # 时间回溯系统
│   │       ├── TileHelper.js # 瓦片管理
│   │       ├── Sprite.js   # 精灵动画
│   │       ├── Animation.js # 动画控制器
│   │       │
│   │       ├── gameObject/ # 游戏对象库
│   │       │   ├── index.js            # 导出所有对象
│   │       │   ├── BaseObject.js       # 游戏对象基类
│   │       │   ├── Player.js           # 玩家
│   │       │   ├── GhostPlayer.js      # 幽灵玩家（时间回溯）
│   │       │   ├── Platform.js         # 平台
│   │       │   ├── MovingPlatform.js   # 移动平台
│   │       │   ├── Enemy.js            # 敌人
│   │       │   ├── Hazard.js           # 危险物（刺儿）
│   │       │   ├── Collectible.js      # 可收集物品
│   │       │   ├── Interactable.js     # 可交互物体
│   │       │   ├── LevelChanger.js     # 关卡切换器
│   │       │   ├── Trigger.js          # 触发器
│   │       │   └── CameraController.js # 摄像机控制器
│   │       │
│   │       └── level/      # 关卡数据
│   │           ├── index.js            # 导出所有关卡
│   │           ├── Prologue.js         # 序章
│   │           ├── Intro.js            # 介绍关卡
│   │           └── ...
│   │
│   ├── assets/             # 游戏资源
│   │   ├── manifest.json   # 资源清单（声明式资源管理）
│   │   │
│   │   ├── audio/          # 音频资源
│   │   │   ├── 阿保剛 - Gate of steiner.mp3
│   │   │   ├── Toby Fox - Home.mp3
│   │   │   ├── To Far Shores.mp3
│   │   │   └── ...
│   │   │
│   │   ├── background/     # 背景图片
│   │   │   ├── raincity0.png          # 视差场景
│   │   │   ├── raincity1.png
│   │   │   ├── raincity2.png
│   │   │   ├── cave.png
│   │   │   ├── factory.png
│   │   │   └── ...
│   │   │
│   │   ├── character/      # 角色立绘
│   │   │   ├── dingzhen/              # （主角）丁真
│   │   │   │   ├── normal.png
│   │   │   │   ├── happy.png
│   │   │   │   ├── confused.png
│   │   │   │   └── ...
│   │   │   ├── wangyuan/              # 王源
│   │   │   ├── otto/                  # 说的道理
│   │   │   └── ...
│   │   │
│   │   ├── dialogue/       # 对话脚本（JSON 格式）
│   │   │   ├── README.md   # 对话脚本编写指南
│   │   │   ├── test_scene.json        # 测试
│   │   │   ├── test_dialogue.json
│   │   │   ├── prologue/              # 序章
│   │   │   │    ├── intro.json
│   │   │   │    ├── zhishiqie.json
│   │   │   │    ├── finish.json
│   │   │   │    └── easter_egg.json
│   │   │   └── ...
│   │   │
│   │   ├── sprite/         # 游戏内精灵图
│   │   │   ├── linggangu.png   # 灵感菇
│   │   │   ├── ruike.png       # 锐刻五代
│   │   │   └── ...
│   │   │
│   │   ├── tiles/          # 瓦片素材（导出自 Spooooky's Asset Pack Mod for Celeste）
│   │   │   ├── index.xml   # 瓦片集规则
│   │   │   ├── default.png
│   │   │   ├── Air.png
│   │   │   ├── Rock.png
│   │   │   ├── RockGrass.png
│   │   │   ├── Snow.png
│   │   │   └── ...（共 80+ 种瓦片）
│   │   │
│   │   ├── font/           # 字体文件
│   │   └── soundEffects/   # 音效文件（导出自东方Project、Minecraft）
│   │
│   ├── style/              # 样式文件
│   │   ├── main.css        # 主样式
│   │   ├── dialogue.css    # 对话样式
│   │   ├── loading.css     # 加载样式
│   │   ├── pause.css       # 暂停样式
│   │   ├── font.css        # 字体样式
│   │   ├── fontawesome.min.css # FontAwesome 图标
│   │   ├── fa-brands-400.woff2
│   │   ├── fa-regular-400.woff2
│   │   ├── fa-solid-900.ttf
│   │   └── fa-solid-900.woff2
│   │
│   └── level-editor/       # 关卡编辑器
│       ├── index.html      # 编辑器页面
│       ├── main.js         # 编辑器逻辑（3000+ 行）
│       ├── style.css       # 编辑器样式
│       └── manifest.json   # 瓦片资源清单，预览用
│
├── about/                  # 团队成员介绍页面
│   ├── index.html
│   ├── style.css
│   ├── Ave_Mujica.png
│   ├── background.jpg
│   │
│   ├── zhangzhenyu/
│   └── ...
│
├── achievements/           # 成就展示页面
│   ├── index.html
│   ├── main.js
│   └── style.css
│
├── login/                  # 登录系统
│   ├── index.html
│   ├── main.js
│   └── style.css
│
└── docs/                   # 文档目录
    ├── template.typ        # 文档模板（Typst）
    │
    ├── 项目计划.typ         # 项目计划书
    ├── 设计开发文档.typ     # 设计开发文档
    ├── 评优申请.typ         # 评优申请书
    └── ...
```
#set par(leading: 0.65em)

== 模块划分

#styled-table(
  columns: (1fr, 2fr, 2fr),
  headers: ([模块], [文件], [功能]),
  rows: (
    ([资源管理], [`Asset.js`], [资源加载、缓存、查询]),
    ([对话系统], [`Dialogue.js`], [剧情对话、角色立绘、事件控制]),
    ([游戏引擎], [`Game2D.js`], [游戏循环、渲染、状态管理]),
    ([音频管理], [`SoundManager.js`], [BGM、音效播放]),
    ([存档管理], [`SaveManager.js`], [游戏保存、加载]),
    ([成就系统], [`AchievementManager.js`], [成就解锁、通知]),
    ([暂停管理], [`PauseManager.js`], [暂停界面、帮助系统]),
    ([时间回溯], [`TimeTravel.js`], [状态快照、时间回溯]),
    ([关卡编辑器], [`level-editor/main.js`], [可视化关卡设计]),
  ),
)

== 第三方资源

#columns(2)[
  === 瓦片素材
  - Spooooky's Asset Pack Mod for Celeste


  === 背景图片
  - nano-banana AI生成
  - Celeste 解包素材

  === 字体文件
  - 普通字体：HarmonyOS Sans SC
  - 衬线字体：Source Han Serif CN
  - 等宽字体：Fira Code、JetBrains Mono
  - 图标字体：FontAwesome

  #colbreak()
  === 音乐
  - Gate of steiner (Steins;Gate)
  - Home (Undertale)
  - To Far Shores (TUNIC)
  - 獣の知性 (东方Project)


  === 音效
  - 东方Project 音效
  - Minecraft 音效
]

= 核心系统设计

== 游戏引擎（Game2D.js）

=== 架构设计

Game2D 采用 *双循环架构*，将逻辑更新与渲染分离：

```js
// 逻辑更新循环（固定时间步长）
setInterval(() => {
  game.update(dt)
}, UPDATE_INTERVAL)

// 渲染循环（requestAnimationFrame）
function renderLoop() {
  requestAnimationFrame(renderLoop)
  game.render(ctx)
}
```

*优势*：
- 逻辑更新频率固定，保证物理模拟精度
- 渲染频率自适应，充分利用硬件性能
- 逻辑与渲染解耦，便于调试和优化

=== 核心数据结构

```js
class Game {
  // 游戏对象
  player                  // 玩家实例
  ghostPlayers = []       // 幽灵玩家列表
  gameObjects = []        // 所有游戏对象
  renderGroups = {}       // 渲染组缓存

  // 游戏状态
  isRunning = false       // 是否运行中
  isTransitioning = false // 是否在切换关卡
  globalState = {}        // 全局玩家状态
  levelData = {}          // 当前关卡数据

  // 时间回溯
  tick = 0                // 当前帧数
  maxTick = 0             // 历史最大帧数
  history = new Map()     // 状态快照历史

  // 渲染系统
  camera                  // 摄像机实例
  canvas                  // 主画布
  ctx                     // 主画布上下文
  tmpCanvas               // 临时画布
  tmpCtx                  // 临时画布上下文
  tileCanvas              // 瓦片画布
  tileCtx                 // 瓦片画布上下文
}
```

=== 渲染组优化

为避免每帧遍历所有游戏对象进行类型判断，Game2D 将对象按类型分组缓存：

```js
renderGroups = {
  platforms: [],          // 静态平台
  movingPlatforms: [],    // 移动平台
  collectibles: [],       // 可收集物品
  enemies: [],            // 敌人与陷阱
  interactables: [],      // 可交互物体
  triggers: [],           // 触发器与摄像机控制器
}
```

每次对象列表变更时调用 `updateRenderGroups()` 重建缓存。

=== Canvas 管理

Game2D 使用三个独立的 Canvas：

#styled-table(
  columns: (1fr, 1fr, 2fr),
  headers: ([Canvas], [类型], [用途]),
  rows: (
    ([`canvas`], [主画布], [显示在页面上，绘制最终画面]),
    ([`tmpCanvas`], [离屏画布], [时间回溯预览、特效合成]),
    ([`tileCanvas`], [离屏画布], [预渲染瓦片地图，提升性能]),
  ),
)

== 资源管理系统（Asset.js）

=== 设计理念

- *声明式管理*：通过 `manifest.json` 统一声明资源
- *自动类型识别*：根据文件扩展名自动选择加载器
- *递归加载*：支持嵌套目录结构
- *进度跟踪*：提供实时加载进度回调

=== manifest.json 格式

```json
{
  "audio": {
    "Home": "audio/Toby Fox - Home.mp3",
    "test": "audio/獣の知性 - [TH19] 東方獣王園.mp3"
  },
  "background": {
    "raincity0": "background/raincity0.png",
    "home": "background/home.png"
  },
  "character": {
    "dingzhen": {
      "normal": "character/dingzhen/normal.png",
      "happy": "character/dingzhen/happy.png",
      "angry": "character/dingzhen/angry.png"
    }
  },
  "dialogue": {
    "chapter1_start": "dialogue/chapter1_start.json"
  }
}
```

=== 资源键名映射

加载后，资源通过路径式键名访问：

- `background.home` → `Asset.get('background/home')`
- `character.dingzhen.normal` → `Asset.get('character/dingzhen/normal')`
- `audio.Home` → `Asset.get('audio/Home')`

#info-box(
  type: "warning",
)[
  访问键名使用斜杠 `/` 分隔层级，而非点号 `.`。
]

=== 加载流程

```js
// 1. 加载 manifest.json
const manifest = await fetch('assets/manifest.json')
  .then(r => r.json())

// 2. 递归解析资源路径
const paths = Asset.parseManifest(manifest)

// 3. 并行加载所有资源
const promises = paths.map(path => Asset.load(path))
await Promise.all(promises)

// 4. 缓存到内存
Asset.cache.set(key, resource)
```

== 对话系统（Dialogue.js）

=== 设计特点

- *事件驱动*：基于 JSON 的事件流控制剧情
- *多风格支持*：现代风格（逐字显示）和东方风格（气泡对话）
- *角色系统*：动态添加/移除角色，支持多表情切换
- *文本样式*：内联样式标记（`$样式类:文本$`）
- *键盘交互*：Enter/空格推进，Ctrl 快进，Esc 暂停

=== 对话脚本格式

```json
{
  "text_style": "modern",
  "auto_next_delay": 0,
  "events": [
    {
      "action": "add",
      "id": "alice",
      "key": "alice",
      "title": "爱丽丝",
      "subtitle": "冒险者",
      "title_color": "#ff6b9d",
      "position": "left",
      "emotion": "normal"
    },
    {
      "action": "dialogue",
      "id": "alice",
      "emotion": "happy",
      "text": "你好！欢迎来到这个世界。"
    },
    "简化写法，沿用上一说话者",
    {
      "action": "remove",
      "id": "alice"
    },
    {
      "action": "background",
      "background": "raincity0"
    },
    {
      "action": "bgm",
      "bgm": "Home"
    }
  ]
}
```

=== 事件类型

#styled-table(
  columns: (1fr, 3fr),
  headers: ([事件], [说明]),
  rows: (
    ([`add`], [添加角色到场景，指定位置、表情]),
    ([`dialogue`], [显示对话文本，可切换表情]),
    ([`remove`], [移除角色]),
    ([`background`], [切换背景图片]),
    ([`bgm`], [播放背景音乐]),
    ([`sound`], [播放音效]),
    ([`wait`], [等待指定时间]),
  ),
)

=== 文本样式标记

对话文本支持内联样式标记：

```
"这是$wow:强调文本$，这是$shake:抖动文本$"
```

样式类在 `dialogue.css` 中定义：

```css
.wow {
  color: #ff6b9d;
  font-weight: bold;
  animation: rainbow 2s linear infinite;
}

.shake {
  animation: shake 0.5s infinite;
}
```

=== 交互控制

- *推进对话*：Enter、空格、鼠标点击
- *快进*：按住 Ctrl
- *暂停*：Esc 键
- *自动播放*：配置 `auto_next_delay`

== 音频管理系统（SoundManager.js）

=== 功能特性

- *BGM 播放*：背景音乐循环播放、淡入淡出
- *音效管理*：音效触发、音量控制
- *音量控制*：独立的 BGM 和音效音量
- *状态管理*：静音、暂停、恢复

=== 核心 API

```js
// BGM 控制
SoundManager.playBGM('Home')
SoundManager.stopBGM()
SoundManager.fadeOutBGM(1000)

// 音效播放
SoundManager.playSound('jump')

// 音量控制
SoundManager.setBGMVolume(0.5)
SoundManager.setSoundVolume(0.8)
```

=== 实现细节

```js
class SoundManager {
  static #currentBGM = null
  static #bgmVolume = 0.5
  static #soundVolume = 0.8

  static playBGM(key) {
    const audio = Asset.get(`audio/${key}`)
    if (this.#currentBGM) {
      this.#currentBGM.pause()
    }
    this.#currentBGM = audio
    audio.loop = true
    audio.volume = this.#bgmVolume
    audio.play()
  }

  static playSound(key) {
    const audio = Asset.get(`audio/${key}`).cloneNode()
    audio.volume = this.#soundVolume
    audio.play()
  }
}
```

== 存档系统（SaveManager.js）

=== 存档结构

```js
{
  name: '存档名称',
  timestamp: 1234567890,
  levelData: {
    name: 'Stage1',
    introDialogue: null,
    // ...
  },
  gameObjects: [
    {
      type: 'Platform',
      x: 100, y: 200,
      width: 50, height: 16,
      // ...
    },
    // ...
  ],
  player: {
    x: 150, y: 180,
    vx: 0, vy: 0,
    // ...
  },
  globalState: {
    collectedItems: ['item1', 'item2'],
    unlockedLevels: ['Prologue', 'Stage1'],
    // ...
  }
}
```

=== 序列化与反序列化

*导出游戏对象*：

```js
exportGameObjects() {
  return this.gameObjects.map(obj => ({
    type: obj.constructor.name,
    ...obj.export()
  }))
}
```

*导入游戏对象*：

```js
importGameObjects(data) {
  this.gameObjects = data.map(objData => {
    const Class = GameObject[objData.type]
    return Class.import(objData)
  })
}
```

=== 多用户支持

存档使用用户名作为键名前缀：

```js
const key = `rewind-pearl-save-${username}`
localStorage.setItem(key, JSON.stringify(saveData))
```

=== 自动保存

游戏在关键节点自动保存：

- 进入新关卡
- 完成对话
- 收集物品
- 页面关闭前

```js
window.addEventListener('beforeunload', () => {
  game.saveGame('自动保存', true, true)
})
```

== 成就系统（AchievementManager.js）

=== 成就定义

```js
const achievements = {
  'dian_ji_ji_song': {
    title: '点击即送',
    description: '第一次启动游戏',
    icon: 'fas fa-play-circle'
  },
  'level_complete': {
    title: '咕咕嘎嘎',
    description: '收集所有的灵感菇',
    icon: 'fas fa-star'
  },
  // ...
}
```

=== 解锁机制

```js
// 解锁成就
AchievementManager.add('dian_ji_ji_song')

// 检查是否已解锁
if (AchievementManager.has('level_complete')) {
  // ...
}

// 获取所有成就
const all = AchievementManager.getAll()
```

=== 通知显示

解锁成就时显示通知：

```js
game.showNotification('成就解锁：点击即送', {
  icon: '🏆',
  type: 'achievement'
})
```

== 时间回溯系统（TimeTravel.js）

=== 核心机制

时间回溯是游戏的核心玩法，允许玩家回到过去改变历史。

*状态快照*：

```js
// 每帧记录状态
game.history.set(game.tick, {
  player: game.player.export(),
  gameObjects: game.exportGameObjects()
})
```

*时间回溯*：

```js
// 回溯到指定帧
TimeTravel.rewind(targetTick)

// 从历史记录恢复状态
const snapshot = game.history.get(targetTick)
game.player.import(snapshot.player)
game.importGameObjects(snapshot.gameObjects)
```

=== 幽灵玩家

回溯时会产生"幽灵玩家"，重放之前的行动：

```js
class GhostPlayer {
  constructor(history) {
    this.history = history  // 历史轨迹
    this.tick = 0
  }

  update() {
    const state = this.history.get(this.tick)
    if (state) {
      this.x = state.x
      this.y = state.y
      this.tick++
    }
  }
}
```

=== 回溯预览

在回溯界面显示时间线预览：

```js
TimeTravel.render(game) {
  const ctx = game.tmpCtx

  // 绘制历史帧缩略图
  for (let i = 0; i < maxTick; i += 10) {
    const snapshot = game.history.get(i)
    // 渲染缩略图
  }

  // 绘制到主画布
  game.ctx.drawImage(game.tmpCanvas, 0, 0)
}
```

== 关卡系统

=== 关卡数据结构

```js
export function Stage1(game) {
  game.levelData = {
    introDialogue: 'stage1_intro',  // 进入对话
    background: 'raincity0',         // 背景图
    spawnpoint: new Vec2(100, 200),  // 出生点
    cameraHeight: 180,                // 摄像机高度
    cameraBound: {                    // 摄像机边界
      x: 0, y: 0,
      width: 320, height: 180
    },
    tileWidth: 160,                   // 地图宽度（瓦片数）
    tileHeight: 90,                   // 地图高度（瓦片数）
  }

  // 瓦片调色板
  game.tilePalette = {
    ' ': 'Air',
    'R': 'Rock',
    'G': 'RockGrass',
    // ...
  }

  // 瓦片地图数据
  game.tileData = [
    '                                ',
    '                                ',
    '            GGGGG               ',
    '            RRRRR               ',
    // ...
  ]

  // BGM
  game.sound.playBGM('Home')

  // 游戏对象
  game.gameObjects.push(
    new Platform(100, 200, 50, 16),
    new Collectible(150, 180, 'mushroom'),
    new Enemy(200, 200, 16, 16, 'patrol', 100),
    new Interactable(250, 200, 16, 16, 'dialogue', 'sprite', '提示'),
    // ...
  )
}
```

=== 瓦片系统

瓦片系统用于高效渲染地图：

```js
class TileHelper {
  constructor(tileData, tilePalette) {
    this.tileData = tileData
    this.tilePalette = tilePalette
    this.edges = []  // 碰撞边缘
  }

  render(ctx) {
    // 预渲染瓦片到离屏 Canvas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = tileData[y][x]
        const tileName = tilePalette[char]
        const tileImage = Asset.get(`tiles/${tileName}`)
        ctx.drawImage(tileImage, x * 8, y * 8)
      }
    }

    // 提取碰撞边缘
    this.extractEdges()
  }
}
```

=== 摄像机系统

```js
class Camera {
  constructor(width, height, bound) {
    this.width = width
    this.height = height
    this.bound = bound
    this.x = 0
    this.y = 0
  }

  follow(target, smooth = 0.1) {
    // 平滑跟随目标
    const targetX = target.x - this.width / 2
    const targetY = target.y - this.height / 2

    this.x += (targetX - this.x) * smooth
    this.y += (targetY - this.y) * smooth

    // 边界限制
    this.x = Math.max(this.bound.x, Math.min(
      this.bound.x + this.bound.width - this.width,
      this.x
    ))
    this.y = Math.max(this.bound.y, Math.min(
      this.bound.y + this.bound.height - this.height,
      this.y
    ))
  }
}
```

=== 视差背景

支持多层视差背景：

```js
// HTML 结构
<div id="game2d-background">
  <img id="bg-base" class="bg-image" />
  <img id="bg-layer-1" class="bg-image layer-1" />
  <img id="bg-layer-2" class="bg-image layer-2" />
</div>

// 视差效果
layer1.style.transform = `translate(${-camera.x * 0.5}px, 0)`
layer2.style.transform = `translate(${-camera.x * 0.3}px, 0)`
```

== 游戏对象系统

=== 对象继承体系

```
BaseObject（基类）
├── Platform（平台）
│   └── MovingPlatform（移动平台）
├── Player（玩家）
├── Enemy（敌人）
├── Hazard（危险物）
├── Collectible（可收集物）
├── Interactable（可交互物）
├── Trigger（触发器）
└── CameraController（摄像机控制器）
```

=== BaseObject 基类

```js
class BaseObject {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.visible = true
  }

  update(dt, game) {
    // 更新逻辑
  }

  render(ctx, camera) {
    // 渲染逻辑
  }

  export() {
    // 导出状态
    return { x: this.x, y: this.y, ... }
  }

  static import(data) {
    // 导入状态
    return new this(data.x, data.y, ...)
  }
}
```

=== 玩家（Player）

```js
class Player extends BaseObject {
  constructor(x, y) {
    super(x, y, 10, 16)
    this.vx = 0
    this.vy = 0
    this.onGround = false
    this.facing = 'right'
    this.sprite = new Sprite('player')
  }

  update(dt, game) {
    // 输入处理
    if (Keyboard.isPressed('a')) this.vx = -100
    if (Keyboard.isPressed('d')) this.vx = 100
    if (Keyboard.isPressed(' ') && this.onGround) {
      this.vy = -200
    }

    // 物理更新
    this.vy += 500 * dt  // 重力
    this.x += this.vx * dt
    this.y += this.vy * dt

    // 碰撞检测
    this.checkCollision(game)

    // 摩擦力
    this.vx *= 0.8
  }

  checkCollision(game) {
    // 与平台碰撞
    for (const platform of game.renderGroups.platforms) {
      if (this.intersects(platform)) {
        // 解决碰撞
      }
    }
  }
}
```

=== 可交互物（Interactable）

```js
class Interactable extends BaseObject {
  constructor(x, y, width, height, action, sprite, prompt) {
    super(x, y, width, height)
    this.action = action    // 'dialogue', 'item', 'trigger'
    this.sprite = sprite
    this.prompt = prompt    // 提示文本
  }

  update(dt, game) {
    // 检测玩家接近
    if (this.isNear(game.player) && Keyboard.isJustPressed('e')) {
      this.interact(game)
    }
  }

  interact(game) {
    if (this.action === 'dialogue') {
      Dialogue.play(this.dialogueKey)
    } else if (this.action === 'item') {
      game.globalState.items.push(this.itemKey)
      this.destroy()
    }
  }
}
```

= 响应式设计

== 布局策略

游戏使用 *固定宽高比*（16:9）的响应式布局：

```css
:root {
  --game-aspect-ratio: 16 / 9;
}

main {
  aspect-ratio: var(--game-aspect-ratio);
  width: min(100vw, calc(100vh * var(--game-aspect-ratio)));
}
```

*效果*：
- 在宽屏显示器上，游戏宽度填满视口
- 在竖屏设备上，游戏高度填满视口
- 始终保持 16:9 宽高比，无变形

== Canvas 缩放

Canvas 使用固定的内部分辨率（320×180），然后缩放到容器大小：

```js
// 内部分辨率
canvas.width = 320
canvas.height = 180

// CSS 缩放到容器大小
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.style.imageRendering = 'pixelated'  // 像素风格
```

*优势*：
- 保持像素风格
- 减少渲染开销
- 统一的坐标系统

== 移动端适配

虽然游戏主要面向 PC，但也考虑了移动端的基本适配，所有页面在任意大小的设备上都能良好显示：

```css
@media (max-width: 768px) {
  .dialogue-container {
    font-size: 14px;
  }

  .pause-menu {
    padding: 1em;
  }
}
```

= 交互性设计

== 键盘控制

=== 游戏控制

#styled-table(
  columns: (1fr, 2fr),
  headers: ([按键], [功能]),
  rows: (
    ([A / ←], [向左移动]),
    ([D / →], [向右移动]),
    ([Space], [跳跃]),
    ([E], [交互]),
    ([长按Q+E], [时间回溯]),
    ([Esc], [暂停/取消]),
  ),
)

=== 对话控制

#styled-table(
  columns: (1fr, 2fr),
  headers: ([按键], [功能]),
  rows: (
    ([Enter / Space], [推进对话]),
    ([Ctrl], [快进（按住）]),
    ([Esc], [暂停]),
  ),
)

== 鼠标交互

=== 菜单操作

暂停界面、存档界面等使用鼠标点击。

== 视觉反馈

=== 按键反馈

- 按下跳跃时播放音效
- 交互时显示提示文本
- 收集物品时播放动画

=== 状态提示

- 保存成功显示通知
- 成就解锁显示通知
- 关卡切换淡入淡出

= 关卡编辑器

详见关卡编辑器内置帮助（点击左下角操作栏处帮助按钮）。

== 功能特性

- *可视化编辑*：直观的图形界面
- *多种工具*：指针、平台、敌人、可交互物等
- *瓦片绘制*：支持 80+ 种瓦片
- *对象属性*：可视化编辑对象参数
- *代码导出*：一键导出关卡 JS 代码
- *实时预览*：即时查看关卡效果

== 界面布局

#image("PixPin 2025-10-10 23-28-21.png")

#pagebreak()

== 工具列表

#styled-table(
  columns: (1fr, 2fr),
  headers: ([工具], [功能]),
  rows: (
    ([指针], [选择、移动、调整对象]),
    ([平台], [绘制静态平台]),
    ([移动平台], [绘制移动平台]),
    ([敌人], [放置敌人]),
    ([可交互物], [放置可交互对象]),
    ([收集物], [放置收集品]),
    ([触发器], [放置触发器]),
    ([摄像机控制器], [控制摄像机行为]),
    ([瓦片画笔], [绘制瓦片地图]),
  ),
)

== 关卡代码示例

```js
// 导出代码
function exportCode() {
  return `
import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function ${levelName}(game) {
  game.levelData = {
    introDialogue: '${introDialogue}',
    background: '${background}',
    spawnpoint: new Vec2(${spawnX}, ${spawnY}),
    // ...
  }

  game.tilePalette = ${JSON.stringify(tilePalette)}

  game.tileData = [
    ${tileData.map(row => \`'\${row}'\`).join(',\\n    ')}
  ]

  game.sound.playBGM('${bgm}')

  game.gameObjects.push(
    ${objects.map(obj => obj.toCode()).join(',\\n    ')}
  )
}
  `
}
```

= 调试模式

== 开启调试模式

在浏览器控制台执行：

```js
localStorage.setItem('rewind-pearl-debug-mode', 'true')
```

== 调试功能

- *碰撞可视化*：显示碰撞箱
- *坐标显示*：显示玩家坐标、速度矢量，显示运动物体速度矢量
- *快速跳关*：输入关卡名称跳转

== 调试界面

#image("PixPin 2025-10-10 23-32-05.png")

= 性能优化

== 渲染优化

=== 离屏 Canvas

使用 OffscreenCanvas 预渲染静态内容：

```js
// 预渲染瓦片地图
tileHelper.render(tileCtx)

// 游戏中直接绘制离屏 Canvas
ctx.drawImage(tileCanvas, -camera.x, -camera.y)
```

*收益*：减少每帧 80×90 = 7200 次 drawImage 调用

=== 渲染组缓存

按类型分组缓存游戏对象，避免每帧过滤：

```js
// 不优化：每帧遍历所有对象
gameObjects.forEach(obj => {
  if (obj instanceof Platform) {
    obj.render(ctx, camera)
  }
})

// 优化：使用渲染组缓存
renderGroups.platforms.forEach(platform => {
  platform.render(ctx, camera)
})
```

== 逻辑优化

=== 碰撞检测优化

使用 AABB（轴对齐包围盒）快速剔除：

```js
intersects(other) {
  return this.x < other.x + other.width &&
         this.x + this.width > other.x &&
         this.y < other.y + other.height &&
         this.y + this.height > other.y
}
```

=== 固定时间步长

逻辑更新使用固定时间步长，与渲染解耦，保证物理模拟精度与稳定性：

```js
setInterval(() => {
  game.update(UPDATE_INTERVAL / 1000)
}, UPDATE_INTERVAL)
```

== 资源优化

=== 图片压缩

- 背景图片：WebP 格式，减小体积的同时优化加载速度
- 角色立绘：PNG 格式
- 瓦片素材：PNG 格式

=== 音频压缩

- BGM：MP3 格式
- 音效：MP3 格式

=== 资源预加载

在启动时预加载所有资源，避免运行时卡顿。

```js
// Loading.init()
await Asset.loadFromManifest('assets/', data =>
  this.updateProgress(data)
)
```

== 内存优化

=== 状态快照压缩

状态快照压缩字段名称为数组，避免冗余数据：

```js
// Player.js
get state() {
  return {
    ...super.state,

    P: [
      this.gravity,
      this.moveSpeed,
      this.jumpSpeed,
      this.jumpKeyPressed,
      this.jumpTimer,
      this.maxJumpTime,

      // ...
    ],
  }
}
```

=== 丢弃旧快照

限制历史快照数量，避免内存泄漏：

```js
this.history.set(this.tick, this.exportGameObjects())
this.history.delete(this.tick - GameConfig.MAX_SNAPSHOTS_COUNT)
```

=== 及时清理

关卡切换时清理旧对象：

```js
async changeLevel(targetLevel) {
  this.stop()  // 停止游戏循环
  this.gameObjects = []  // 清空对象
  this.history.clear()  // 清空历史
  this.loadLevel(targetLevel)
  await this.start()
}
```

= 测试与兼容性

详见《项目总结文档》的测试部分。

= 技术亮点

== 创新点

- *时间回溯机制*：完整的状态快照和回溯系统
- *关卡编辑器*：可视化关卡设计工具
- *瓦片系统*：高效的地图渲染方案
- *事件驱动对话*：灵活的剧情控制

== 技术难点

- *状态序列化*：需要保证数据一致性
- *渲染性能*：大量对象的高效渲染
- *时间回溯*：状态管理和内存优化
- *关卡编辑器*：复杂的交互逻辑
- *碰撞检测*：精确的碰撞解决

== 代码质量

- *模块化*：清晰的模块划分
- *可维护性*：完整的注释和文档
- *可扩展性*：开放的对象系统
- *规范性*：统一的代码风格

= 附录

== 关键数据结构

=== Vector2

```js
class Vec2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(v) { return new Vec2(this.x + v.x, this.y + v.y) }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y) }
  mul(s) { return new Vec2(this.x * s, this.y * s) }
  length() { return Math.sqrt(this.x ** 2 + this.y ** 2) }
  normalize() { return this.mul(1 / this.length()) }
}
```

=== AABB（轴对齐包围盒）

```js
class AABB {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  intersects(other) {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y
  }
}
```

== 核心算法

=== 碰撞检测与响应

```js
function resolveCollision(player, platform) {
  const overlapX = Math.min(
    player.x + player.width - platform.x,
    platform.x + platform.width - player.x
  )
  const overlapY = Math.min(
    player.y + player.height - platform.y,
    platform.y + platform.height - player.y
  )

  if (overlapX < overlapY) {
    // 水平碰撞
    if (player.x < platform.x) {
      player.x = platform.x - player.width
    } else {
      player.x = platform.x + platform.width
    }
    player.vx = 0
  } else {
    // 垂直碰撞
    if (player.y < platform.y) {
      player.y = platform.y - player.height
      player.onGround = true
    } else {
      player.y = platform.y + platform.height
    }
    player.vy = 0
  }
}
```

=== 摄像机平滑跟随

```js
function smoothFollow(camera, target, smooth = 0.1) {
  const targetX = target.x - camera.width / 2
  const targetY = target.y - camera.height / 2

  camera.x += (targetX - camera.x) * smooth
  camera.y += (targetY - camera.y) * smooth

  // 边界限制
  camera.x = clamp(camera.x, bound.x, bound.x + bound.width - camera.width)
  camera.y = clamp(camera.y, bound.y, bound.y + bound.height - camera.height)
}
```
