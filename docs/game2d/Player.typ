// ============================================================================
// Player 文档
// rewind-pearl 游戏引擎 - 玩家角色系统
// ============================================================================

#import "../template.typ": *

#show: initialize-document(
  title: "Player & GhostPlayer",
  subtitle: "玩家角色系统",
  authors: ("windlandneko",),
)

= *Player* 玩家

`Player` 类是 rewind-pearl 游戏的核心，实现了玩家角色的所有物理运动、输入处理、动画管理和状态记录。玩家系统采用了现代平台跳跃游戏的多项优化技术，提供流畅的操作手感。

== 核心特性

- *精确物理系统*：基于速度和加速度的物理模拟，支持重力、摩擦力
- *高级跳跃机制*：土狼时间（Coyote Time）、跳跃缓冲（Jump Buffer）、多段跳
- *输入系统*：支持键盘输入，输入状态可记录和回放
- *动画管理*：自动根据运动状态切换行走、跳跃等动画
- *状态记录*：每帧记录完整状态，支持时间回溯功能
- *死亡系统*：爆炸动画、摄像机震动、自动重生

== 构造函数

#api(
  name: "new Player(x, y)",
  description: "创建玩家对象",
  parameters: (
    (name: "x", type: "number", description: "初始 X 坐标"),
    (name: "y", type: "number", description: "初始 Y 坐标"),
  ),
  example: ```js
  // 通常不需要手动创建，引擎会根据关卡数据创建
  game.levelData.spawnpoint = new Vec2(24, 8)
  // 引擎会在此坐标创建玩家
  ```,
)

= 物理属性

玩家的物理系统控制角色的移动和跳跃。

== 基本物理参数

#styled-table(
  columns: (1.5fr, 1fr, 3fr),
  headers: ([属性], [默认值], [说明]),
  rows: (
    ([`gravity`], [520], [重力加速度（像素/秒²）]),
    ([`moveSpeed`], [56], [地面移动速度（像素/秒）]),
    ([`jumpSpeed`], [120], [初始跳跃速度（像素/秒）]),
    ([`v`], [Vec2(0, 0)], [当前速度向量（像素/秒）]),
    ([`onGround`], [false], [是否在地面上]),
  ),
  caption: [玩家基本物理参数],
)

== 尺寸和碰撞

```js
width = 7        // 玩家碰撞箱宽度
height = 15      // 玩家碰撞箱高度
groundCheckBox   // 地面检测框，位于玩家脚下
```

玩家的碰撞箱较小（7×15），但渲染的精灵图更大（32×32），这样可以提供更宽容的碰撞判定。

= 跳跃系统

玩家的跳跃系统实现了多项现代平台游戏的技术，大幅提升操作手感。

== 基础跳跃

#api(
  name: "onJumpInput()",
  description: "处理跳跃输入，自动判断跳跃类型（地面跳跃、土狼时间跳跃、多段跳）",
  returns: (type: "boolean", description: "是否成功跳跃"),
)

基础跳跃特性：
- 按下空格键（Space）触发跳跃
- 跳跃时施加向上的初始速度
- 按住跳跃键可延长跳跃高度（最多 0.16 秒）
- 提前松开跳跃键可实现小跳

== 土狼时间 (Coyote Time)

*什么是土狼时间？*

土狼时间是一种宽容机制：玩家离开平台边缘后的短暂时间内（默认 0.15 秒），仍然可以执行跳跃。这个设计灵感来自《威利狼与哔哔鸟》（Wile E. Coyote），卡通角色跑出悬崖后有短暂时间才会掉下去。

#styled-table(
  columns: (1.5fr, 1fr, 3fr),
  headers: ([属性], [默认值], [说明]),
  rows: (
    ([`coyote`], [0.15], [土狼时间窗口（秒）]),
    ([`coyoteTimer`], [0], [当前土狼时间计时器]),
  ),
  caption: [土狼时间参数],
)

*工作原理*：

```js
// 玩家离开地面时，启动土狼时间计时
if (!this.onGround && this.previousOnGround) {
  this.coyoteTimer = this.coyote  // 0.15 秒
}

// 在空中时，土狼时间递减
if (!this.onGround) {
  this.coyoteTimer -= dt
}

// 按下跳跃键时，如果土狼时间未耗尽，允许跳跃
if (this.coyoteTimer > 0) {
  this.performJump()
  this.coyoteTimer = 0  // 立即清零
}
```

*效果*：
- 玩家在平台边缘失足时，仍有机会跳跃
- 大幅降低操作难度，提升手感
- 玩家感觉更加"聪明"和"流畅"

== 跳跃缓冲 (Jump Buffer)

*什么是跳跃缓冲？*

跳跃缓冲允许玩家提前按下跳跃键。如果在落地前的短时间内（默认 0.1 秒）按下跳跃键，角色落地后会自动跳跃，无需精确把握时机。

#styled-table(
  columns: (1.5fr, 1fr, 3fr),
  headers: ([属性], [默认值], [说明]),
  rows: (
    ([`jumpBuffer`], [0.1], [跳跃缓冲窗口（秒）]),
    ([`jumpBufferTimer`], [0], [当前缓冲计时器]),
  ),
  caption: [跳跃缓冲参数],
)

*工作原理*：

```js
// 玩家在空中按下跳跃键但无法跳跃时，激活缓冲
if (!canJump) {
  this.jumpBufferTimer = this.jumpBuffer  // 0.1 秒
}

// 每帧递减缓冲计时
if (this.jumpBufferTimer > 0) {
  this.jumpBufferTimer -= dt

  // 在缓冲期内落地，立即执行跳跃
  if (this.onGround) {
    this.performJump()
    this.jumpBufferTimer = 0
  }
}
```

*效果*：
- 连续快速跳跃更加容易
- 减少"我明明按了跳跃键"的挫败感
- 特别适合快节奏的平台游戏

== 多段跳 (Air Jump)

玩家可以在空中进行额外的跳跃，适合制作更加动作化的关卡。

#styled-table(
  columns: (1.5fr, 1fr, 3fr),
  headers: ([属性], [默认值], [说明]),
  rows: (
    ([`maxAirJumps`], [0], [最大空中跳跃次数（0 表示无二段跳）]),
    ([`airJumpSpeed`], [80], [空中跳跃速度，通常小于初始跳跃速度]),
    ([`airJumpsCount`], [0], [当前已使用的空中跳跃次数]),
  ),
  caption: [多段跳参数],
)

*用法示例*：

```js
// 在触发器中给予玩家二段跳能力
new $.Trigger(100, 100, 32, 32, true, (game, $) => {
  game.player.maxAirJumps = 1  // 允许二段跳
  game.player.maxAirJumps = 2  // 允许三段跳
}, null)

// 或者在关卡开始时设置
export function MyLevel(game) {
  // ... 关卡初始化
  game.player.maxAirJumps = 2  // 允许二段跳
}
```

*特性*：
- 落地后自动重置已使用次数
- 空中跳跃速度通常小于初始跳跃，避免过于强大
- 可以动态修改 `maxAirJumps`，实现能力升级

== 跳跃系统总结

跳跃类型的优先级：

1. *地面跳跃*：在地面上直接跳跃（优先级最高）
2. *土狼时间跳跃*：离开地面后 0.15 秒内仍可跳跃
3. *多段跳*：空中跳跃（如果 `maxAirJumps > 0`）
4. *跳跃缓冲*：以上都不满足时，激活缓冲等待落地

这些机制可以同时生效，互不冲突，共同提供极致的操作手感。

= 移动系统

玩家的水平移动同样经过精心调优，提供流畅的操作体验。

== 移动控制

#api(
  name: "onHorizontalInput(direction, dt)",
  description: "处理水平移动输入",
  parameters: (
    (name: "direction", type: "number", description: "-1 向左，1 向右，0 停止"),
    (name: "dt", type: "number", description: "时间增量（秒）"),
  ),
)

*按键映射*：
- 向左：A 键或左箭头 ←
- 向右：D 键或右箭头 →
- 向下：S 键或下箭头 ↓（用于穿过脚手架）

== 移动特性

地面移动：
- 加速度：14（地面加速更快）
- 最大速度：56 像素/秒
- 摩擦力：停止移动后快速减速（指数衰减）

空中移动：
- 加速度：10（空中加速较慢）
- 最大速度：84 像素/秒（空中速度更快，1.5 倍）
- 空中阻力：较小，保持动量

*设计思路*：

```js
// 地面移动：快速响应
const groundAcceleration = 14
const groundMaxSpeed = this.moveSpeed

// 空中移动：更高的最大速度，但加速慢
const airAcceleration = 10
const airMaxSpeed = this.moveSpeed * 1.5
```

这种设计使得：
- 地面操作精确，容易控制
- 空中有更多惯性，适合长距离跳跃
- 玩家可以通过空中移动微调落点

= 输入系统

玩家的输入系统使用位标志（Bit Flags）高效记录输入状态，支持完整的状态回放。

== InputEnum 枚举

```js
export const InputEnum = {
  INTERACT:    1 << 0,  // 0b000001 - E键交互
  JUMP_DOWN:   1 << 1,  // 0b000010 - 按下跳跃
  JUMP_UP:     1 << 2,  // 0b000100 - 松开跳跃
  WALK_LEFT:   1 << 3,  // 0b001000 - 向左移动
  WALK_RIGHT:  1 << 4,  // 0b010000 - 向右移动
  WALK_DOWN:   1 << 5,  // 0b100000 - 向下移动
}
```

== 输入处理流程

```js
async processInputEvents(dt, game) {
  // 1. 读取键盘输入
  const keyLeft = Keyboard.anyActive('A', 'ArrowLeft')
  const keyRight = Keyboard.anyActive('D', 'ArrowRight')
  const keyJump = Keyboard.anyActive('Space')

  // 2. 转换为输入状态（位标志）
  if (keyLeft) this.inputState |= InputEnum.WALK_LEFT
  if (keyRight) this.inputState |= InputEnum.WALK_RIGHT

  // 3. 执行对应逻辑
  if (this.inputState & InputEnum.JUMP_DOWN) this.onJumpInput()
  if (this.inputState & InputEnum.WALK_LEFT) this.onHorizontalInput(-1, dt)

  // 4. 清空输入状态（下一帧重新收集）
  this.inputState = 0
}
```

*优势*：
- 紧凑高效：单个整数存储所有输入
- 易于记录：每帧记录 `inputState` 到 `stateHistory`
- 支持回放：幽灵玩家从历史记录读取输入

= 动画系统

玩家动画通过 `AnimationManager` 管理，根据运动状态自动切换。

== 动画类型

#styled-table(
  columns: (1.5fr, 3fr),
  headers: ([动画名称], [触发条件]),
  rows: (
    ([`walk_left`], [在地面上向左移动（速度 > 5）]),
    ([`walk_right`], [在地面上向右移动（速度 > 5）]),
    ([`jump_left`], [在空中且朝向左侧]),
    ([`jump_right`], [在空中且朝向右侧]),
  ),
  caption: [玩家动画类型],
)

== 动画切换逻辑

```js
updateAnimation() {
  const direction = this.v.x > 0 ? 1 : -1

  if (!this.onGround) {
    // 空中：播放跳跃动画
    this.animationManager.playAnimation(
      direction > 0 ? 'jump_right' : 'jump_left'
    )
  } else if (Math.abs(this.v.x) > 5) {
    // 地面且移动：播放行走动画
    this.animationManager.playAnimation(
      this.v.x > 0 ? 'walk_right' : 'walk_left'
    )
  } else {
    // 地面且静止：待机动画（TODO）
  }
}
```

= 死亡与重生系统

玩家死亡时会触发爆炸动画、摄像机震动，然后在重生点重新开始。

== 死亡触发

#api(
  name: "onDamage()",
  description: "玩家受到伤害，生命值减少",
  returns: (type: "null", description: "无返回值"),
)

当 `health` 降至 0 时，触发死亡流程。

爆炸动画播放完毕后，自动重生。

*设计细节*：
- 死亡不会保留任何状态，完全重新开始
- 时间回溯记录被清空
- 所有收集品重置
- 摄像机重新跟踪新玩家

= 状态记录与时间回溯

玩家每帧都会记录完整状态到 `stateHistory`，支持时间回溯功能。

== 状态记录

```js
// 每帧更新时记录状态
this.stateHistory.set(game.tick, this.state)
// 删除过旧的记录（超过 MAX_SNAPSHOTS_COUNT）
this.stateHistory.delete(game.tick - MAX_SNAPSHOTS_COUNT)
```

== 时间回溯应用

时间回溯时，创建 `GhostPlayer` 从历史记录回放：

```js
// 创建幽灵玩家
const ghost = new GhostPlayer(x, y)
ghost.stateHistory = player.stateHistory  // 共享历史记录
ghost.lifetimeBegin = 0
ghost.lifetimeEnd = game.tick
```

幽灵玩家会按照记录的输入状态重现玩家的操作。

= 生命值与得分

#styled-table(
  columns: (1.5fr, 1fr, 3fr),
  headers: ([属性], [默认值], [说明]),
  rows: (
    ([`maxHealth`], [1], [最大生命值]),
    ([`health`], [1], [当前生命值]),
    ([`score`], [0], [得分（目前未使用）]),
  ),
  caption: [生命值与得分],
)

*注意*：
- 当前游戏中玩家只有 1 点生命，受到任何伤害都会死亡
- `maxHealth` 保留用于未来扩展
- `score` 目前没什么用

= 使用示例

== 动态调整玩家能力

在关卡中可以动态修改玩家能力：

```js
// 给予二段跳
game.player.maxAirJumps = 1

// 提升移动速度
game.player.moveSpeed = 80

// 增强跳跃高度
game.player.jumpSpeed = 150

// 调整重力（低重力环境）
game.player.gravity = 300
```

== 配合触发器使用

永久获得能力：

```js
new $.Trigger(200, 100, 64, 64, true,
  (game, $) => {
  game.player.maxAirJumps = 2
  game.sound.play('powerup')
}, null)

```

暂时获得能力：

```js
new $.Trigger(400, 100, 64, 64, false,
  (game, $) => {
    game.player.moveSpeed = 28  // 减速
  },
  (game, $) => {
    game.player.moveSpeed = 56  // 恢复
  }
)
```

== 访问玩家状态

在触发器或其他游戏对象中访问玩家状态：
```js
if (game.player.onGround) {
  console.log('玩家站在地面上')
}

if (game.player.v.y < 0) { // 注意速度方向是相反的
  console.log('玩家正在上升')
}

if (game.player.r.x > 500) {
  console.log('玩家已到达关卡后半段')
}
```

= *GhostPlayer* 幽灵玩家

`GhostPlayer` 是 `Player` 的子类，代表玩家过去的自己。用于时间回溯功能，重现玩家之前的操作。游戏支持多次时间回溯，创建多个幽灵玩家。

幽灵玩家有特殊的半透明视觉效果。

幽灵玩家的输入不来自键盘，而是从历史记录读取。

== 概述

当玩家使用时间回溯能力时：

1. 当前玩家的操作记录被保存
2. 创建一个 `GhostPlayer` 实例
3. 幽灵玩家从头开始回放记录的输入
4. 玩家可以与过去的自己协作完成谜题

== 特性差异

#styled-table(
  columns: (1fr, 1fr, 2fr),
  headers: ([], [Player], [GhostPlayer]),
  rows: (
    ([输入来源], [实时键盘输入], [历史键盘输入回放]),
    ([透明度], [不透明（100%）], [半透明（60%）]),
    ([生命周期], [持续存在], [有限时间]),
    ([交互能力], [完全交互], [部分交互，如不会触发对话]),
    ([时空连续性验证], [无], [已禁用（有bug）]),
  ),
)


== 状态一致性验证

幽灵玩家包含状态验证逻辑，用于检测时间线不一致（目前已禁用）：

```js
validateState(record) {
  const state = this.state
  // 检查当前物理模拟的状态是否与记录一致
  if (!Object.keys(record).every(key =>
    key === 'type' ||
    key === 'inputState' ||
    record[key] === state[key]
  )) {
    this.unstable++  // 记录不一致次数
    console.log('时间线不稳定')
  }
}
```

这个功能计划用于破坏时空结构结局，不过目前有bug。

== 幽灵玩家与游戏机制

=== 协作谜题

幽灵玩家可以与当前玩家协作：

```js
// 需要两个玩家同时踩下按钮才能开门
let playersOnButton = 0

new $.Trigger(100, 100, 16, 16, false, (game, $) => {
  playersOnButton++
  if (playersOnButton >= 2) {
    $('door').show()
  }
}, (game, $) => {
  playersOnButton--
  if (playersOnButton < 2) {
    $('door').hide()
  }
})
```

=== 限制与设计

- *不可对话*：幽灵玩家无法触发 `Interactable` 对话
- *可触发机关*：可以踩下按钮、触发 `Trigger`
- *半透明显示*：容易区分当前玩家和过去的自己
- *固定生命周期*：从 `lifetimeBegin` 到 `lifetimeEnd`

= 最佳实践

#info-box(type: "tip")[
  *玩家能力调优建议*：

  - *跳跃高度*：`jumpSpeed` 通常在 100-150 之间
  - *移动速度*：`moveSpeed` 通常在 40-80 之间
  - *重力*：`gravity` 建议 400-600，过低会感觉漂浮
  - *土狼时间*：0.1-0.2 秒最佳，过长会感觉不真实
  - *跳跃缓冲*：0.08-0.15 秒，不建议超过 0.2 秒
  - *多段跳*：`airJumpSpeed` 应小于 `jumpSpeed`，避免过强
]

#info-box(type: "note")[
  *关卡设计提示*：

  - 在教学关卡中不要修改默认参数，让玩家熟悉基础手感
  - 能力提升应该明显可感知（至少 20% 差异）
  - 给予新能力时播放音效和特效
  - 考虑在检查点重置玩家能力，避免混淆
]

#info-box(type: "warning")[
  *常见问题*：

  - *不要修改 `UPDATE_PER_SECOND`*：这会破坏物理一致性
  - *不要在多处同时修改玩家属性*：容易造成状态混乱
  - *时间回溯后玩家能力会保留*：如果需要重置，手动设置
  - *幽灵玩家不会触发对话*：这是设计决定，避免重复剧情
]
