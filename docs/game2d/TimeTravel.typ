// ============================================================================
// TimeTravel.js 模块文档
// rewind-pearl 游戏引擎 - 时间回溯系统
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "TimeTravel.js",
  subtitle: "时间回溯系统",
  authors: ("windlandneko",),
)

= 模块介绍

`TimeTravel.js` 是 rewind-pearl 游戏引擎的核心机制模块，实现了游戏的时间回溯功能。玩家可以通过长按 Q+E 键触发时间回溯预览，松开后回到过去的某个时间点，当前玩家会转化为「幽灵玩家」，新的玩家实例在过去时刻重新开始。

== 核心特性

- *预览系统*：圆形扩散的时间回溯预览效果
- *状态恢复*：精确恢复过去时刻的游戏状态
- *幽灵玩家*：保留原玩家的历史轨迹作为幽灵
- *限制机制*：可配置的时间回溯次数上限
- *视觉反馈*：渐变圆环、边框动画、临时画布合成

== 导入方式

```js
import TimeTravel from './game2d/TimeTravel.js'

// TimeTravel 是单例，已自动实例化
// 在 Game2D 中自动集成：
TimeTravel.game = this  // 绑定游戏实例
```

= 时间回溯机制

== 触发条件

1. 玩家同时按下 Q 和 E 键
2. 玩家在地面上（`player.onGround === true`）
3. 未达到时间回溯次数上限（`timeTravelUsed < timeTravelMax`）

== 回溯流程

```
用户按下 Q+E
    ↓
startTimeTravelPreview()
    ├─ 记录起始 tick
    ├─ 开始蓄力（state = 'pending'）
    └─ 圆圈半径逐渐增大
    ↓
蓄力达到阈值（TIME_TRAVEL_CHARGE_TIME）
    ├─ 有剩余次数 → state = 'success'
    └─ 无剩余次数 → state = null（失败）
    ↓
state = 'success' 时，圆圈加速扩散
    ↓
圆圈覆盖整个屏幕
    ↓
executeTimeTravel()
    ├─ 当前玩家 → 转为幽灵玩家
    ├─ 创建新玩家实例
    ├─ 回到过去的 tick
    └─ 恢复游戏对象状态
    ↓
时间回溯完成
```

== 状态机

#styled-table(
  columns: (1fr, 3fr),
  headers: ([状态], [说明]),
  rows: (
    ([`null`], [未激活]),
    ([`'pending'`], [蓄力中（圆圈扩散）]),
    ([`'success'`], [蓄力成功，准备执行回溯]),
  ),
  caption: [TimeTravel 状态],
)

= API 参考

== 初始化

#api(
  name: "set game(game)",
  description: "绑定游戏实例（由 Game2D 自动调用）。",
  parameters: (
    (name: "game", type: "Game", description: "Game2D 实例"),
  ),
  returns: (type: "null", description: "无返回值"),
)

== 预览控制

#api(
  name: "startTimeTravelPreview()",
  description: "开始时间回溯预览。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  notes: [
    - 如果已处于 `'success'` 状态，忽略调用
    - 记录当前 tick 为起始 tick
    - 初始化圆圈半径和最大半径
    - 设置状态为 `'pending'`
  ],
)

#api(
  name: "endTimeTravelPreview()",
  description: "取消时间回溯预览。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  notes: [如果未达到 `'success'` 状态，将状态重置为 `null`。],
)

#api(
  name: "get canTimeTravel",
  description: "查询是否可以执行时间回溯（是否有剩余次数）。",
  parameters: (),
  returns: (type: "boolean", description: "可以回溯返回 true"),
)

== 更新与渲染

#api(
  name: "update(dt)",
  description: "更新时间回溯逻辑（由 Game2D 每帧调用）。",
  parameters: (
    (name: "dt", type: "number", description: "帧间隔时间（秒）"),
  ),
  returns: (type: "null", description: "无返回值"),
  notes: [
    - 在 `'pending'` 状态下，计算蓄力进度并更新圆圈半径
    - 达到阈值时切换到 `'success'` 或 `null`
    - 在 `'success'` 状态下，加速扩散圆圈
    - 圆圈覆盖屏幕后执行 `executeTimeTravel()`
  ],
)

#api(
  name: "render()",
  description: "渲染时间回溯预览效果（由 Game2D 每帧调用）。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  notes: [
    - 如果半径为 0 或历史记录不存在，跳过渲染
    - 在临时画布上绘制过去时刻的游戏画面
    - 应用圆形裁剪和渐变边框
    - 合成到主画布
  ],
)

== 核心执行

#api(
  name: "executeTimeTravel()",
  description: "执行时间回溯（内部方法，自动触发）。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  notes: [
    - 将当前玩家转为幽灵玩家，记录状态历史
    - 创建新玩家实例，继承当前状态
    - 计算目标 tick（`startTick - deltaTick * 5`）
    - 从历史记录中恢复游戏对象状态
    - 恢复所有幽灵玩家的历史状态
    - 递增时间回溯使用次数
  ],
)

= 核心属性

#styled-table(
  columns: (2fr, 1fr, 3fr),
  headers: ([属性], [类型], [说明]),
  rows: (
    ([`state`], [`string | null`], [当前状态（`null` / `'pending'` / `'success'`）]),
    ([`radius`], [`number`], [当前圆圈半径（像素）]),
    ([`radiusMax`], [`number`], [最大圆圈半径（屏幕对角线的一半）]),
    ([`startTick`], [`number`], [蓄力开始时的 tick]),
    ([`deltaTick`], [`number`], [蓄力持续的 tick 数]),
  ),
)

= 配置参数

时间回溯相关配置在 `GameConfig.js` 中定义：

```js
// GameConfig.js
export const TIME_TRAVEL_CHARGE_TIME = 180  // 蓄力时间（tick，约 3 秒）
export const MAX_SNAPSHOTS_COUNT = 1200     // 历史快照保留数量（约 20 秒）
```

```js
// 全局状态（Game2D.globalState）
{
  timeTravelUsed: 0,    // 已使用次数
  timeTravelMax: 1,     // 最大可用次数
}
```

= 视觉效果

== 圆圈扩散动画

```js
// pending 状态：缓慢增长
if (this.state === 'pending') {
  const k = 0.1
  let target = 50 + this.deltaTick / 20
  if (!this.canTimeTravel) target = 5 + this.deltaTick / 100
  this.radius = target * k + this.radius * (1 - k)
}

// success 状态：加速扩散
if (this.state === 'success') {
  this.radius += dt * Math.min(800, this.radius ** 2 / 10)
}
```

== 渲染流程

1. 清空临时画布
2. 裁剪为圆形区域（以玩家为中心）
3. 绘制过去时刻的游戏画面：
  - 游戏对象
  - 瓦片地图
  - 幽灵玩家（过去状态）
  - 玩家（过去状态）
4. 应用径向渐变遮罩
5. 在主画布上挖空对应圆形区域
6. 合成临时画布到主画布
7. 绘制圆形边框

== 颜色方案

#styled-table(
  columns: (1fr, 2fr),
  headers: ([状态], [颜色]),
  rows: (
    ([可回溯（pending/success）], [蓝紫色（`rgba(87, 87, 200, 0.5)`）]),
    ([不可回溯（次数用尽）], [红色（`rgba(255, 0, 0, 0.5)`）]),
    ([边框], [白色（success）/ 蓝白色（pending）/ 红色（失败）]),
  ),
  caption: [时间回溯视觉颜色],
)

= 幽灵玩家

时间回溯后，原玩家转为幽灵玩家（`GhostPlayer`）：

```js
const ghost = new GhostPlayer()
ghost.state = state
ghost.stateHistory = this.#game.player.stateHistory

ghost.spawnX = this.#game.player.spawnX
ghost.spawnY = this.#game.player.spawnY
ghost.lifetimeBegin = this.#game.player.lifetimeBegin
ghost.lifetimeEnd = this.#game.tick

this.#game.ghostPlayers.push(ghost)
```

幽灵玩家特性：
- 透明度 50%
- 不可操控，自动回放历史轨迹
- 不与游戏对象交互（特定对象除外）
- `lifetimeBegin` ~ `lifetimeEnd` 之间可见

= 与其他模块的交互

== Game2D

TimeTravel 深度集成到 Game2D 的更新和渲染循环：

```js
// Game2D.js
TimeTravel.game = this

// 更新循环
TimeTravel.update(dt)
if (TimeTravel.state !== null) {
  TimeTravel.deltaTick++
  return  // 暂停游戏逻辑
}

// 渲染循环
TimeTravel.render(this)
```

== Player

玩家类提供时间回溯所需的状态：

```js
// Player.js
class Player {
  stateHistory = new Map()  // 记录每个 tick 的状态

  update(dt, game) {
    // 每帧记录状态
    this.stateHistory.set(game.tick, this.state)
  }
}
```

== GameConfig

配置文件提供时间回溯参数：

```js
// GameConfig.js
export const TIME_TRAVEL_CHARGE_TIME = 180
export const MAX_SNAPSHOTS_COUNT = 1200
```

= 最佳实践

== 增加回溯次数

```js
game.globalState.timeTravelMax++
```

== 「THE WORLD」

```js
game.isRunning = false

```

= 常见问题

== 为什么回溯到过去的 5 倍 deltaTick？

*答*：#strike("为了给玩家留出足够的时间进行操作和决策。直接回到起始 tick 可能导致玩家没有时间反应，尤其是在快节奏的游戏中。通过回溯到过去的 5 倍 deltaTick，玩家可以更好地适应新的局面，避免瞬间切换带来的困惑") 随便设的。

== 幽灵玩家会占用内存吗？

*答*：会。每个幽灵玩家单独保存自己时间区间内的全部 `stateHistory`。

游戏本身会根据 `MAX_SNAPSHOTS_COUNT` 限制游戏自己的历史记录长度，清理时间过久的游戏记录。
