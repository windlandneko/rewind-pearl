// ============================================================================
// main.js 模块文档
// rewind-pearl 游戏引擎 - 游戏入口与启动流程
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "main.js 文档",
  subtitle: "游戏入口与启动流程",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`main.js` 是 rewind-pearl 游戏的入口模块，负责游戏的启动流程控制、用户登录检查、资源加载监听、存档加载、新游戏初始化等核心功能。该模块是游戏启动的第一个执行点，协调各个子系统的初始化和启动顺序。

== 核心特性

- *启动流程控制*：协调资源加载、存档检查、游戏启动的完整流程
- *用户认证*：检查用户登录状态，未登录则重定向到登录页面
- *存档管理*：自动加载自动存档或启动新游戏
- *调试模式*：支持调试模式下跳过加载和存档检查
- *错误处理*：捕获存档加载错误并回退到新游戏
- *成就系统集成*：游戏启动时解锁特定成就

== 导入方式

`main.js` 作为入口模块，通常在 HTML 中直接引入：

```html
<script type="module" src="./script/main.js"></script>
```

#info-box(
  title: "注意",
  type: "info",
)[
  `main.js` 不导出任何内容，它是一个自执行的入口脚本，在加载时自动执行初始化逻辑。
]

= 启动流程

== 完整启动流程图

```
页面加载
    ↓
检查用户登录状态
    ├─ 未登录 → 重定向到登录页面
    └─ 已登录 ↓
        ↓
Loading.init() 开始资源加载
    ↓
资源加载中...
    ↓
资源加载完成 → Loading.on('complete')
    ↓
解锁成就 'dian_ji_ji_song'
    ↓
检查调试模式
    ├─ 调试模式 → 直接启动新游戏
    └─ 正常模式 ↓
        ↓
检查自动存档
    ├─ 有存档 → 尝试加载存档
    │   ├─ 成功 → Game2D.loadGame(saveData)
    │   └─ 失败 → 启动新游戏
    └─ 无存档 → 启动新游戏
        ↓
Game2D.start()
```

== 启动阶段说明

#styled-table(
  columns: (1fr, 3fr),
  headers: ([阶段], [说明]),
  rows: (
    ([登录检查], [验证 `localStorage['rewind-pearl-username']` 是否存在，未登录则跳转]),
    ([资源加载], [通过 `Loading.init()` 加载所有游戏资源]),
    ([加载完成], [监听 `Loading.on('complete')` 事件，触发后续流程]),
    ([成就解锁], [解锁"点击即送"成就（游戏启动成就）]),
    ([调试模式检查], [检查 `localStorage['rewind-pearl-debug-mode']`，调试模式下跳过存档]),
    ([存档检查], [读取 `localStorage['rewind-pearl-autosave-{username}']`]),
    ([游戏启动], [调用 `Game2D.loadGame()` 或 `startNewGame()`]),
  ),
  caption: [游戏启动阶段],
)

= 配置项说明

== localStorage 键名

`main.js` 使用以下 `localStorage` 键：

#styled-table(
  columns: (2fr, 3fr),
  headers: ([键名], [说明]),
  rows: (
    ([`rewind-pearl-username`], [当前登录的用户名]),
    ([`rewind-pearl-debug-mode`], [调试模式标志（任意值表示启用）]),
    ([`rewind-pearl-autosave-{username}`], [用户的自动存档数据（JSON 字符串）]),
  ),
  caption: [localStorage 配置键],
)

== 调试模式

调试模式效果：跳过存档检查，始终启动新游戏。

```js
// 启用调试模式
localStorage.setItem('rewind-pearl-debug-mode', 'true')
// 禁用调试模式
localStorage.removeItem('rewind-pearl-debug-mode')
```

= 注意事项

#info-box(
  title: "登录状态依赖",
  type: "warning",
)[
  游戏启动依赖于用户登录状态（`localStorage['rewind-pearl-username']`）。确保登录系统正确设置此值，否则会陷入重定向循环。
]

#info-box(
  title: "存档数据格式",
  type: "info",
)[
  自动存档数据是 JSON 格式的字符串，必须能被 `JSON.parse()` 正确解析。存档数据结构应由 `Game2D.saveGame()` 生成，确保兼容性。
]

#info-box(
  title: "调试模式影响",
  type: "warning",
)[
  调试模式会跳过存档检查，始终启动新游戏。生产环境应确保未启用调试模式，否则用户无法继续游戏。
]

#info-box(
  title: "成就系统初始化",
  type: "info",
)[
  在调用 `AchievementManager.add()` 之前，需要确保 `AchievementManager.game` 已设置。通常在 `Game2D` 初始化时设置。
]

#info-box(
  title: "资源加载顺序",
  type: "info",
)[
  `Loading.init()` 必须在注册 `complete` 事件监听器之后调用，否则可能错过事件。当前代码顺序正确。
]

#info-box(
  title: "页面刷新行为",
  type: "info",
)[
  刷新页面会重新执行 `main.js`，重复启动流程。游戏应在退出时保存自动存档，刷新后可以继续。
]

= 技术细节

== 模块依赖图

```
main.js
  ├─ Loading.js
  │   ├─ Asset.js
  │   └─ utils.js
  ├─ Game2D.js
  │   └─ (游戏核心系统)
  ├─ AchievementManager.js
  │   ├─ SoundManager.js
  │   └─ (通知系统)
  └─ Levels (关卡模块)
      └─ Prologue.js
```

== 执行时机

`main.js` 通过 `<script type="module">` 引入，在 DOM 加载完成后执行。

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... -->
</head>
<body>
  <!-- 游戏 UI 元素 -->
  <div class="loading-container">...</div>
  <canvas id="game-canvas"></canvas>
  
  <!-- 入口脚本 -->
  <script type="module" src="./script/main.js"></script>
</body>
</html>
```

ES6 模块会在 HTML 解析完成后、`DOMContentLoaded` 之前执行。

== 异步流程控制

虽然 `main.js` 本身不是异步函数，但通过事件监听器实现异步流程：

```js
// 同步代码
const currentUser = localStorage.getItem('rewind-pearl-username')

// 注册异步回调
Loading.on('complete', () => {
  // 资源加载完成后执行
})

// 启动异步加载
Loading.init()
```

等价于：

```js
async function main() {
  const currentUser = localStorage.getItem('rewind-pearl-username')
  
  await Loading.init()
  
  // complete 回调内容
  AchievementManager.add('dian_ji_ji_song')
  // ...
}

main()
```

== 错误处理策略

存档加载错误处理采用"宽容"策略：

1. 捕获 JSON 解析错误
2. 记录错误日志
3. 回退到新游戏
4. 不显示错误提示（对用户透明）

这确保即使存档损坏，游戏仍可正常启动。

== 关卡加载

```js
import * as Levels from './game2d/level/index.js'

function startNewGame() {
  Game2D.loadLevel(Levels.Prologue)
  Game2D.start(true)
}
```

`Levels` 是关卡模块的命名空间导出，包含所有关卡配置：

```js
// level/index.js
export { default as Prologue } from './Prologue.js'
export { default as Chapter1 } from './Chapter1.js'
export { default as Chapter2 } from './Chapter2.js'
// ...
```

`Levels.Prologue` 是一个关卡配置对象，包含地图数据、初始化逻辑等。

== 自动存档键名

自动存档键名包含用户名，实现用户隔离：

```js
'rewind-pearl-autosave-player1'
'rewind-pearl-autosave-player2'
'rewind-pearl-autosave-admin'
```

不同用户的存档互不影响，支持多账户共用同一浏览器。

== 入口脚本职责

`main.js` 的职责定位：

✅ 应该做的：
- 用户认证
- 启动流程控制
- 资源加载监听
- 存档加载与新游戏选择
- 全局配置检查

❌ 不应该做的：
- 游戏逻辑实现
- UI 渲染
- 事件处理
- 复杂业务逻辑

保持入口脚本简洁，复杂逻辑交给专门的模块处理。
