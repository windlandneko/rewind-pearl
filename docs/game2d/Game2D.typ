// ============================================================================
// Game2D.js 模块文档
// rewind-pearl 游戏引擎 - 核心游戏管理器
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "Game2D.js",
  subtitle: "核心游戏管理器",
  authors: ("windlandneko",),
)

= 模块介绍

`Game2D.js` 是 rewind-pearl 游戏引擎的核心模块，负责整个 2D 游戏的主循环、状态管理、渲染协调和系统集成。它统一管理玩家、游戏对象、摄像机、关卡数据、时间回溯历史等所有游戏运行时数据，是游戏引擎的中枢。

== 核心特性

- *游戏循环管理*：独立的更新循环（固定时间步长）和渲染循环（requestAnimationFrame）
- *游戏对象管理*：统一管理所有游戏对象，支持动态添加/移除
- *渲染组优化*：按对象类型分组缓存，避免每帧重复过滤
- *时间回溯系统*：记录游戏状态快照，支持时间回溯机制
- *关卡系统*：关卡加载、切换、过渡效果
- *存档系统*：游戏状态保存与加载，支持多用户存档
- *摄像机集成*：视差背景、平滑跟随、边界限制
- *多画布渲染*：主画布、临时画布、瓦片画布分离
- *调试模式*：提供丰富的调试信息和可视化工具

== 导入方式

```js
import Game2D from './game2d/Game2D.js'

// Game2D 是单例，已自动实例化
Game2D.loadLevel(Level1)
await Game2D.start()
```

#info-box(
  type: "warning",
)[
  `Game2D.js` 导出的是已实例化的单例对象，全局只有一个 Game 实例。
]

= 架构设计

== 游戏循环

Game2D 采用 *双循环架构*，将逻辑更新与渲染分离：

#styled-table(
  columns: (0.7fr, 1.2fr, 2fr),
  headers: ([循环类型], [实现方式], [职责]),
  rows: (
    (
      [更新循环],
      [`setInterval`],
      [游戏逻辑、物理计算、碰撞检测、状态更新],
    ),
    (
      [渲染循环],
      [`requestAnimationFrame`],
      [Canvas 绘制、摄像机更新、视觉效果渲染],
    ),
  ),
  caption: [双循环架构],
)

== 渲染组系统

为优化性能，Game2D 将游戏对象按类型分组缓存：

```js
renderGroups = {
  platforms: [],        // 静态平台
  movingPlatforms: [],  // 移动平台
  collectibles: [],     // 可收集物品
  enemies: [],          // 敌人与陷阱
  interactables: [],    // 可交互物体
  triggers: [],         // 触发器与摄像机控制器
}
```

每次对象列表变更时调用 `#updateRenderGroups()` 重建缓存，避免每帧遍历全部对象。

== Canvas 管理

Game2D 使用三个独立的 Canvas 元素：

```js
  canvas       // 主画布
* tmpCanvas    // 临时画布：时间回溯预览、特效合成
* tileCanvas   // 瓦片画布：预渲染地形
```

后两个画布为 Offscreen Canvas，不直接插入 DOM，提升渲染效率。

= 核心属性

== 游戏对象

#styled-table(
  columns: (1fr, 1fr, 2fr),
  headers: ([属性], [类型], [说明]),
  rows: (
    ([`player`], [`Player`], [当前玩家实例]),
    ([`ghostPlayers`], [`GhostPlayer[]`], [幽灵玩家列表（时间回溯产生）]),
    ([`gameObjects`], [`BaseObject[]`], [所有游戏对象列表]),
    ([`renderGroups`], [`Object`], [按类型分组的渲染缓存]),
  ),
)

== 游戏状态

#styled-table(
  columns: (1fr, 1fr, 2fr),
  headers: ([属性], [类型], [说明]),
  rows: (
    ([`isRunning`], [`boolean`], [游戏是否在运行]),
    ([`isTransitioning`], [`boolean`], [是否在切换关卡]),
    ([`globalState`], [`Object`], [全局玩家状态]),
    ([`levelData`], [`Object`], [当前关卡数据]),
  ),
)

== 时间回溯相关

#styled-table(
  columns: (0.5fr, 1fr, 1fr),
  headers: ([属性], [类型], [说明]),
  rows: (
    ([`tick`], [`number`], [当前游戏帧数]),
    ([`maxTick`], [`number`], [历史最大帧数]),
    ([`history`], [`Map<number, Object[]>`], [状态快照历史记录]),
  ),
)

== 摄像机与渲染系统

#styled-table(
  columns: (0.5fr, 1fr, 1fr),
  headers: ([属性], [类型], [说明]),
  rows: (
    ([`camera`], [`Camera`], [摄像机实例]),
    ([`scale`], [`number`], [渲染缩放比例]),
    ([`ctx`], [`CanvasRenderingContext2D`], [主画布上下文]),
    ([`tmpctx`], [`CanvasRenderingContext2D`], [临时画布上下文]),
    ([`tileCtx`], [`CanvasRenderingContext2D`], [瓦片画布上下文]),
  ),
)

= API 参考

== 关卡管理

#api(
  name: "loadLevel(setupFunction)",
  description: "加载关卡数据，初始化游戏对象和摄像机。",
  parameters: (
    (name: "setupFunction", type: "Function", description: [关卡设置函数，接收 `game` 实例作为参数，在函数内配置关卡]),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import { Level1 } from './level/index.js'

  Game2D.loadLevel(Level1)
  ```,
  notes: [
    - 重置 tick、history、gameObjects、ghostPlayers
    - 调用关卡设置函数配置 levelData
    - 创建玩家实例并初始化摄像机
    - 渲染瓦片地图到 tileCanvas
    - 从瓦片边缘生成隐藏平台（用于碰撞检测）
  ],
)

#api(
  name: "start(initial)",
  description: "启动游戏循环，开始游戏。",
  parameters: (
    (name: "initial", type: "boolean", optional: true, description: "是否为初次进入关卡（用于控制淡入效果）"),
  ),
  returns: (type: "Promise<void>", description: "异步返回"),
  example: ```js
  await Game2D.start(true)
  ```,
  notes: [
    - 显示帮助提示（仅首次）
    - 播放关卡开场对话
    - 注册键盘监听器
    - 启动更新循环和渲染循环
    - 初始化渲染组
  ],
)

#api(
  name: "stop()",
  description: "停止游戏循环。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  notes: "清除更新循环、渲染循环和键盘监听器。",
)

#api(
  name: "changeLevel(targetLevel)",
  description: "切换到指定关卡，带有淡入淡出过渡效果。",
  parameters: (
    (name: "targetLevel", type: "string", description: [目标关卡名称（需在 `Levels` 中注册）]),
  ),
  returns: (type: "Promise<void>", description: "异步返回"),
  example: ```js
  await Game2D.changeLevel('Level2')
  ```,
  notes: "自动处理淡出 → 停止 → 加载 → 启动 → 淡入的完整流程。",
)

#api(
  name: "fadeBlack(reverse)",
  description: "执行黑屏淡入/淡出效果。",
  parameters: (
    (name: "reverse", type: "boolean", optional: true, description: "是否反向（淡入），默认为 false（淡出）"),
  ),
  returns: (type: "Promise<void>", description: "异步返回"),
)

== 存档系统

#api(
  name: "saveGame(name, autosave, silent)",
  description: "保存当前游戏状态。",
  parameters: (
    (name: "name", type: "string", optional: true, description: "存档名称，默认为「未命名存档」"),
    (name: "autosave", type: "boolean", optional: true, description: "是否为自动存档，默认 false"),
    (name: "silent", type: "boolean", optional: true, description: "是否静默保存（不显示通知），默认 false"),
  ),
  returns: (type: "boolean", description: "保存成功返回 true，失败返回 false"),
  example: ```js
  // 手动存档
  Game2D.saveGame('Boss 战前')

  // 自动存档（静默）
  Game2D.saveGame('自动存档', true, true)
  ```,
  notes: [
    - 需要用户已登录（`rewind-pearl-username`）
    - 保存数据包含：玩家状态、游戏对象、关卡数据、全局状态
    - 自动存档每 6000 tick（约 100 秒）触发一次
  ],
)

#api(
  name: "loadGame(saveData)",
  description: "加载存档数据，恢复游戏状态。",
  parameters: (
    (
      name: "saveData",
      type: "Object",
      description: [存档数据对象，包含 `levelData`、`player`、`gameObjects`、`globalState`],
    ),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  const saveData = JSON.parse(
    localStorage.getItem('rewind-pearl-autosave-player1')
  )
  Game2D.loadGame(saveData)
  ```,
)

== 游戏对象管理

#api(
  name: "importGameObjects(stateArray)",
  description: "从状态数组导入游戏对象（用于时间回溯/存档加载）。",
  parameters: (
    (name: "stateArray", type: "Object[]", description: "游戏对象状态数组"),
  ),
  returns: (type: "null", description: "无返回值"),
  notes: [自动根据 `type` 字段创建对应类型的实例并恢复状态。],
)

#api(
  name: "exportGameObjects()",
  description: "导出所有游戏对象的状态数组。",
  parameters: (),
  returns: (type: "Object[]", description: "状态数组"),
)

#api(
  name: "ref(name)",
  description: [通过 `_ref` 名称获取游戏对象引用。],
  parameters: (
    (name: "name", type: "string", description: [对象的 `_ref` 属性值]),
  ),
  returns: (type: "BaseObject | undefined", description: "游戏对象实例，未找到返回 undefined"),
  example: ```js
  const door = Game2D.ref('main-door')
  if (door) door.open()
  ```,
)

== 更新与渲染

#api(
  name: "update(dt)",
  description: "更新游戏逻辑（由更新循环调用）。",
  parameters: (
    (name: "dt", type: "number", description: "帧间隔时间（秒），固定为 0.01667（60FPS）"),
  ),
  returns: (type: "Promise<void>", description: "异步返回"),
  notes: [
    - 更新摄像机
    - 更新时间回溯系统
    - 更新玩家和幽灵玩家
    - 更新所有游戏对象
    - 执行碰撞检测
    - 记录状态快照到历史
    - 移除标记为删除的对象
  ],
)

#api(
  name: "render(ctx)",
  description: "渲染游戏画面（由渲染循环调用）。",
  parameters: (
    (name: "ctx", type: "CanvasRenderingContext2D", description: "画布上下文"),
  ),
  returns: (type: "null", description: "无返回值"),
  notes: [
    - 清空画布
    - 应用摄像机变换
    - 按优先级渲染各渲染组
    - 渲染瓦片地图
    - 渲染玩家和幽灵玩家
    - 渲染调试信息（debug 模式）
  ],
)

== 通知系统

#api(
  name: "showNotification(message, options)",
  description: "显示游戏内通知消息。",
  parameters: (
    (name: "message", type: "string", description: "通知消息文本"),
    (
      name: "options",
      type: "Object",
      optional: true,
      description: [选项对象，包含 `icon`（图标）和 `type`（类型：info/success/error）],
    ),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  Game2D.showNotification('获得钥匙！', {
    icon: '🔑',
    type: 'success'
  })
  ```,
)

== 调试功能

#api(
  name: "set debug(value)",
  description: "开启/关闭调试模式。",
  parameters: (
    (name: "value", type: "boolean", description: "true 开启，false 关闭"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 按右 Ctrl 键切换调试模式
  // 或手动设置
  Game2D.debug = true
  ```,
  notes: "调试模式显示：网格、碰撞箱、玩家状态、摄像机信息、性能数据等。",
)

#api(
  name: "pauseUpdateUntilTick(tick)",
  description: "暂停更新指定帧数（用于时间回溯后的缓冲）。",
  parameters: (
    (name: "tick", type: "number", description: "暂停帧数"),
  ),
  returns: (type: "null", description: "无返回值"),
)

= 键盘控制

Game2D 自动注册以下键盘监听器：

#styled-table(
  columns: (1fr, 3fr),
  headers: ([按键], [功能]),
  rows: (
    ([`Space`], [跳跃]),
    ([`E`], [交互]),
    ([`Q + E`], [长按触发时间回溯预览]),
    ([`R`], [重生（调试用）]),
    ([`Esc`], [暂停游戏]),
    ([`右 Ctrl`], [切换调试模式]),
    ([`小键盘 Enter`], [跳转到指定关卡（调试）]),
    ([`M`], [导出当前画面为 PNG]),
  ),
  caption: [键盘快捷键],
)

= 时间回溯系统

Game2D 使用 `history` Map 记录游戏状态快照：

```js
// 每帧记录当前状态
this.history.set(this.tick, this.exportGameObjects())

// 删除过老的快照（保留最近 MAX_SNAPSHOTS_COUNT 帧）
this.history.delete(this.tick - GameConfig.MAX_SNAPSHOTS_COUNT)
```

时间回溯时：
1. TimeTravel 计算目标 tick
2. 从 history 中获取对应状态
3. 将当前玩家转为幽灵玩家
4. 创建新玩家，恢复目标状态
5. 更新所有游戏对象状态

详见 `TimeTravel.js` 文档。

= 视差背景系统

Game2D 支持三层视差背景：

#styled-table(
  columns: (1fr, 1fr, 3fr),
  headers: ([图层], [视差系数], [说明]),
  rows: (
    ([`bg-base`], [0.3], [远景层，移动最慢]),
    ([`bg-layer-1`], [0.6], [中景层]),
    ([`bg-layer-2`], [1.0], [近景层，与摄像机同步]),
  ),
  caption: [视差背景图层],
)

背景资源命名规则：

```js
// 关卡设置
this.levelData.background = 'raincity'

// 资源加载
// - background/raincity0.png -> bg-base
// - background/raincity1.png -> bg-layer-1
// - background/raincity2.png -> bg-layer-2

// 或单图模式
// - background/raincity.png -> bg-base
```

= 最佳实践

== 关卡设置示例

```js
export function Level1(game) {
  // 基础配置
  game.levelData.spawnpoint = { x: 50, y: 100 }
  game.levelData.cameraHeight = 180
  game.levelData.cameraBound = { x: 0, y: 0, width: 800, height: 600 }
  game.levelData.background = 'raincity'

  // 开场对话
  game.levelData.introDialogue = 'chapter1_intro'

  // 瓦片地图
  game.tileData = [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
  ]
  game.tilePalette = [null, 'grass']

  // 游戏对象
  game.gameObjects.push(
    new Platform(100, 200, 200, 20),
    new Enemy(300, 180),
    new Collectible(400, 150, 'key'),
  )
}
```

== 性能优化建议

1. *减少实时过滤*：使用 `renderGroups` 缓存，而非每帧 `filter()`
2. *合理使用 `hidden`*：隐藏对象仍会执行逻辑更新，需完全移除用 `removed = true`
3. *限制快照数量*：`MAX_SNAPSHOTS_COUNT` 影响内存占用
4. *离屏剔除*：在 `update` 中判断 `camera.isInView()`，跳过不可见对象

== 存档设计建议

```js
// 在关键节点触发手动存档提示
if (bossDefeated) {
  SaveManager.showSavePrompt((name) => {
    Game2D.saveGame(name)
  })
}

// 频繁的自动存档在后台静默进行
if (tick % 6000 === 5000) {
  Game2D.saveGame('自动存档', true, true)
}
```

= 常见问题

== 为什么有两个循环？

*答*：更新循环使用固定时间步长（60FPS），确保物理计算的确定性；渲染循环跟随浏览器刷新率，确保画面流畅。这样即使渲染帧率波动，游戏逻辑仍保持稳定。

== 如何添加新的游戏对象类型？

*答*：
1. 在 `gameObject/` 目录创建新类，继承 `BaseObject`
2. 在 `gameObject/index.js` 中导出
3. 在 `#updateRenderGroups()` 中添加对应分组（如需）

== 时间回溯会导致内存泄漏吗？

*答*：不会。Game2D 通过 `history.delete(this.tick - MAX_SNAPSHOTS_COUNT)` 自动清理旧快照，始终只保留固定数量的历史记录。
