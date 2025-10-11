// ============================================================================
// GameObject 文档
// rewind-pearl 游戏引擎 - 游戏对象系统
// ============================================================================

#import "../template.typ": *

#show: initialize-document(
  title: "GameObject",
  subtitle: "游戏对象系统",
  authors: ("windlandneko",),
)

= 模块介绍

游戏对象系统是 rewind-pearl 游戏引擎的核心组成部分，包含了游戏中所有可交互元素的实现。所有游戏对象都继承自 `BaseObject` 基类，提供统一的碰撞检测、渲染、状态管理等基础功能。

== 导入方式

```js
import * as $ from './gameObject/index.js'

// 创建游戏对象
const platform = new $.Platform(0, 0, 100, 10)
const interactable = new $.Interactable(50, 50, 16, 16, 'dialogue_id', 'sprite_id')
```
·
== 游戏对象类型

游戏对象系统包含以下类型：

#styled-table(
  columns: (1.5fr, 3fr),
  headers: ([对象类型], [说明]),
  rows: (
    ([`Platform`], [平台对象，玩家可站立的静态平台或可攀爬的脚手架（已弃用，推荐使用瓦片系统）]),
    ([`Interactable`], [可交互对象，触发对话或执行自定义回调]),
    ([`MovingPlatform`], [移动平台，支持多种运动模式的动态平台]),
    ([`LevelChanger`], [关卡切换器，传送玩家到其他关卡]),
    ([`CameraController`], [摄像机控制器，动态调整镜头范围和视野]),
    ([`Collectible`], [收集品，玩家可拾取的物品]),
    ([`Hazard`], [危险区域（刺儿），接触后玩家死亡]),
    ([`Trigger`], [触发器，执行自定义函数的区域]),
  ),
  caption: [游戏对象类型列表],
)

= *BaseObject* 基类

所有游戏对象的基类，提供通用的属性和方法。

== 基础属性

```js
class BaseObject {
  r = new Vec2(x, y)  // 位置向量
  width               // 宽度
  height              // 高度
  hidden = false      // 是否隐藏
  removed = false     // 是否已移除
  refName = null      // 引用名称，用于通过 game.ref() 访问
}
```

== 核心方法

#api(
  name: "checkCollision(other)",
  description: "检测与另一个对象是否发生碰撞",
  parameters: (
    (name: "other", type: "BaseObject | {r, width, height}", description: "另一个对象或包含位置和尺寸的对象"),
  ),
  returns: (type: "boolean", description: "是否发生碰撞"),
)

#api(
  name: "hide()",
  description: "隐藏对象（不渲染，不参与交互）",
  returns: (type: "this", description: "返回自身，支持链式调用"),
)

#api(
  name: "show()",
  description: "显示对象",
  returns: (type: "this", description: "返回自身，支持链式调用"),
)

#api(
  name: "ref(name)",
  description: [设置对象的引用名称，之后可通过 `game.ref(name)` 或回调中的 `$(name)` 访问],
  parameters: (
    (name: "name", type: "string", description: "引用名称"),
  ),
  returns: (type: "this", description: "返回自身，支持链式调用"),
  example: ```js
  new $.MovingPlatform(from, to, 24, 8, false, 2, 'still')
    .ref('door_platform')
  
  // 在其他地方使用
  game.ref('door_platform').set(1)
  ```,
)

= *Platform* 平台

#info-box(type: "warning")[
  `Platform` 类已被标记为弃用。推荐使用游戏的瓦片系统来创建地形。但脚手架功能仍然可用。
]

== 构造函数

#api(
  name: "new Platform(x, y, width, height, ladder)",
  description: "创建一个平台对象",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
    (name: "width", type: "number", description: "宽度"),
    (name: "height", type: "number", description: "高度"),
    (name: "ladder", type: "boolean", optional: true, description: "是否为脚手架（默认 false）"),
  ),
  example: ```js
  // 普通平台（已弃用）
  new $.Platform(0, 100, 200, 10, false)
  
  // 脚手架（可攀爬）
  new $.Platform(120, 80, 24, 8, true)
  ```,
)

== 特性说明

- *普通平台*：玩家可以站立，支持碰撞检测（已弃用，使用瓦片代替）
- *脚手架*：玩家可以上下攀爬，按下方向键下可穿过
- 自动处理碰撞方向（上下左右）

= *Interactable* 可交互对象

可触发对话或执行自定义函数的对象。

== 构造函数

#api(
  name: "new Interactable(x, y, width, height, dialogueId, spriteId, hint, autoPlay, afterInteract)",
  description: "创建可交互对象",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
    (name: "width", type: "number", description: "碰撞区域宽度"),
    (name: "height", type: "number", description: "碰撞区域高度"),
    (name: "dialogueId", type: "string", description: [对话脚本 ID（相对于 `dialogue/` 目录）]),
    (name: "spriteId", type: "string", description: "立绘资源 ID"),
    (name: "hint", type: "string", optional: true, description: "提示文本（默认为空）"),
    (name: "autoPlay", type: "boolean", optional: true, description: "是否自动触发（默认 false）"),
    (name: "afterInteract", type: "function", optional: true, description: "交互后的回调函数"),
  ),
  example: ```js
  // 需要按 E 触发的对话
  new $.Interactable(
    28, 147, 11, 13,
    'chapter1_intro',
    'sprite/npc_alice',
    '按 E 交谈',
    false,
    null
  )
  
  // 自动触发的对话
  new $.Interactable(
    520, 112, 16, 16,
    'auto_dialogue',
    'character/hajimi/normal',
    '',
    true,
    null
  )
  
  // 带有回调的交互
  new $.Interactable(
    100, 100, 16, 16,
    'item_get',
    'sprite/treasure',
    '拾取宝箱',
    false,
    async (game, $) => {
      // 交互后执行的代码
      game.sound.play('item00')
      $('treasure_door').show()
    }
  )
  ```,
)

== 特性说明

- *对话触发*：可播放对话脚本，自动暂停游戏
- *自动/手动*：支持自动触发或按 E 键触发
- *提示文本*：玩家靠近时显示提示
- *回调函数*：对话结束后可执行自定义逻辑
- *立绘显示*：可显示角色立绘或物品图标

#info-box(type: "info")[
  `afterInteract` 回调函数接收两个参数：
  - `game`：游戏实例，可访问游戏的所有功能
  - `$`：引用函数，快捷访问通过 `.ref()` 设置名称的对象
]

= *MovingPlatform* 移动平台

支持多种运动模式的动态平台。

== 构造函数

#api(
  name: "new MovingPlatform(from, to, width, height, ladder, interval, moveType)",
  description: "创建移动平台",
  parameters: (
    (name: "from", type: "Vec2", description: "起点坐标"),
    (name: "to", type: "Vec2", description: "终点坐标"),
    (name: "width", type: "number", description: "宽度"),
    (name: "height", type: "number", description: "高度"),
    (name: "ladder", type: "boolean", optional: true, description: "是否为脚手架（默认 false）"),
    (name: "interval", type: "number", optional: true, description: "完成一次往返的时间（秒，默认 5）"),
    (name: "moveType", type: "string", optional: true, description: "运动类型（默认 'still'）"),
  ),
  example: ```js
  import Vec2 from '../Vector.js'
  
  // 匀速移动平台
  new $.MovingPlatform(
    new Vec2(100, 100),  // 起点
    new Vec2(200, 100),  // 终点
    24, 8,               // 尺寸
    false,               // 非脚手架
    3,                   // 3秒往返
    'linear'             // 匀速运动
  )
  
  // 正弦波移动
  new $.MovingPlatform(
    new Vec2(50, 50),
    new Vec2(50, 150),
    32, 8,
    false,
    4,
    'sin'
  )
  
  // 静止平台（配合触发器使用）
  new $.MovingPlatform(
    new Vec2(200, 40),   // 初始位置（关闭状态）
    new Vec2(200, 16),   // 目标位置（打开状态）
    24, 24,
    false,
    2,
    'still'              // 不自动移动
  ).ref('door_plat')
  ```,
)

== 运动类型

#styled-table(
  columns: (1fr, 3fr),
  headers: ([类型], [说明]),
  rows: (
    ([`linear`], [匀速往返运动，速度恒定]),
    ([`sin`], [正弦波运动，速度平滑变化，两端减速]),
    ([`random`], [随机位置，每帧随机选择位置]),
    ([`still`], [静止不动，需要通过 `set()` 方法手动控制位置]),
  ),
  caption: [移动平台运动类型],
)

== 控制方法

#api(
  name: "set(position)",
  description: "设置平台位置（仅 moveType 为 'still' 时有效）",
  parameters: (
    (name: "position", type: "number", description: "目标位置，0 表示 from，1 表示 to"),
  ),
  returns: (type: "this", description: "返回自身"),
  example: ```js
  // 在触发器中控制平台移动
  new $.Trigger(248, 69, 16, 8, false, (game, $) => {
    $('door_plat').set(1)  // 移动到终点
  }, (game, $) => {
    $('door_plat').set(0)  // 移动到起点
  })
  ```,
)

== 应用场景

- *电梯*：使用 `linear` 或 `sin` 实现垂直上下移动的电梯
- *移动跳板*：横向移动的跳板，增加关卡难度
- *开关门*：使用 `still` 配合触发器实现机关门
- *动态平台*：配合其他对象创建复杂的机关谜题

= *LevelChanger* 关卡切换器

传送玩家到其他关卡的触发区域。

== 构造函数

#api(
  name: "new LevelChanger(x, y, width, height, targetLevel, force)",
  description: "创建关卡切换器",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
    (name: "width", type: "number", description: "触发区域宽度"),
    (name: "height", type: "number", description: "触发区域高度"),
    (name: "targetLevel", type: "string", description: "目标关卡名称"),
    (name: "force", type: "boolean", optional: true, description: "是否强制切换（默认 false）"),
  ),
  example: ```js
  // 需要按 E 键切换（通常用于门）
  new $.LevelChanger(100, 100, 16, 32, 'Stage2', false)
  
  // 自动切换（通常用于关卡边界）
  new $.LevelChanger(536, 128, 104, 16, 'Prologue', true)
  ```,
)

== 特性说明

- *手动切换*（force=false）：玩家位于区域内按 E 键触发，显示目标关卡名称提示
- *自动切换*（force=true）：玩家进入区域自动切换，无需交互
- *过渡动画*：切换时自动播放淡入淡出动画
- *门图标*：自动渲染门的 emoji 图标

#info-box(type: "info")[
  目标关卡名称必须与关卡文件导出的函数名一致。例如目标为 `Stage2`，则需要在 `level/Stage2.js` 中导出 `Stage2` 函数。
]

= *CameraController* 摄像机控制器

动态调整游戏镜头范围和视野的触发器。

== 构造函数

#api(
  name: "new CameraController(x, y, width, height, paddingX, paddingY, pauseSecond, cameraHeight)",
  description: "创建摄像机控制器",
  parameters: (
    (name: "x", type: "number", description: "控制区域 X 坐标"),
    (name: "y", type: "number", description: "控制区域 Y 坐标"),
    (name: "width", type: "number", description: "控制区域宽度"),
    (name: "height", type: "number", description: "控制区域高度"),
    (name: "paddingX", type: "number", optional: true, description: "水平边界扩展（默认 0）"),
    (name: "paddingY", type: "number", optional: true, description: "垂直边界扩展（默认 0）"),
    (name: "pauseSecond", type: "number", optional: true, description: "切换时停顿时间（秒，默认 0.6）"),
    (name: "cameraHeight", type: "number", optional: true, description: "摄像机视野高度（0 表示不改变）"),
  ),
  example: ```js
  // 基础摄像机边界
  new $.CameraController(0, 0, 320, 180, -16, 0, 1).hide()
  
  // 改变视野高度的区域
  new $.CameraController(752, 104, 352, 128, -16, -16, 1.5, 128).hide()
  ```,
)

== 参数说明

#styled-table(
  columns: (1fr, 3fr),
  headers: ([参数], [说明]),
  rows: (
    ([padding], [正数向外扩展触发区域，负数向内收缩。用于微调触发时机]),
    ([pauseSecond], [切换时暂停游戏更新的时间，防止玩家惯性冲出镜头]),
    ([cameraHeight], [设置摄像机视野高度，宽度会自动按屏幕比例计算。0 表示不改变当前视野]),
  ),
  caption: [摄像机控制器参数详解],
)

== 应用场景

- *场景分区*：将大关卡划分为多个摄像机区域，控制玩家视野
- *boss 战*：限制摄像机范围，防止玩家逃离战斗区域
- *视野切换*：在不同区域使用不同的视野高度，营造空间感
- *边界控制*：防止摄像机显示关卡外的空白区域

#info-box(type: "warning")[
  摄像机控制器通常需要隐藏（使用`.hide()`），因为它只是一个逻辑对象，不需要视觉呈现。
]

= *Collectible* 收集品

玩家可拾取的物品，用于奖励、任务或隐藏要素。

== 构造函数

#api(
  name: "new Collectible(x, y, spriteId, onlyGhostCanCollect, onCollect)",
  description: "创建收集品",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
    (name: "spriteId", type: "string", description: "立绘资源 ID"),
    (name: "onlyGhostCanCollect", type: "boolean", optional: true, description: "是否仅幽灵玩家可收集（默认 false）"),
    (name: "onCollect", type: "function", optional: true, description: "收集后的回调函数"),
  ),
  example: ```js
  // 普通收集品
  new $.Collectible(74, 78, 'sprite/strawberry')
  
  // 动画收集品
  new $.Collectible(210, 50, 'sprite/linggangu')
  
  // 仅幽灵可收集
  new $.Collectible(310, 142, 'sprite/ghost_item', true)
  ```,
)

== 特性说明

- *自动收集*：玩家碰到后自动拾取
- *收集动画*：播放上升淡出动画
- *音效*：收集时播放随机音效
- *悬浮效果*：物品会上下轻微浮动
- *精灵动画*：草莓等物品支持帧动画

#info-box(type: "info")[
  `sprite/strawberry` 是特殊资源，会自动播放帧动画。其他收集品使用静态图片。

  #strike([实际上是直接特判了 `sprite/strawberry`，毫无拓展性。])
]

== 关于 onlyGhostCanCollect

此参数用于区分常规玩家和幽灵玩家状态。虽然功能正常，但实际游戏体验中意义不大，通常保持默认值 `false` 即可。

= *Hazard* 危险区域（刺儿）

接触后导致玩家死亡的危险对象。

== 构造函数

#api(
  name: "new Hazard(x, y, width, height, direction)",
  description: "创建危险区域",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
    (name: "width", type: "number", description: "宽度"),
    (name: "height", type: "number", description: "高度"),
    (name: "direction", type: "string", optional: true, description: "尖刺朝向：'up'、'down'、'left'、'right'（默认 'up'）"),
  ),
  example: ```js
  // 向上的地刺
  new $.Hazard(16, 104, 8, 8, 'up')
  
  // 向右的墙刺
  new $.Hazard(32, 120, 8, 16, 'right')
  
  // 隐藏的死亡区（用于关卡底部）
  new $.Hazard(288, 184, 456, 8, 'up').hide()
  ```,
)

== 方向说明

#styled-table(
  columns: (1fr, 3fr),
  headers: ([方向], [说明]),
  rows: (
    ([`up`], [尖刺朝上，通常用于地面陷阱]),
    ([`down`], [尖刺朝下，通常用于天花板]),
    ([`left`], [尖刺朝左，通常用于墙壁右侧]),
    ([`right`], [尖刺朝右，通常用于墙壁左侧]),
  ),
  caption: [危险区域方向],
)

#info-box(type: "info")[
  方向参数仅影响视觉呈现（尖刺的绘制方向），碰撞箱是固定的。所有方向的危险区域对玩家的伤害效果相同。
]

== 应用场景

- *地面陷阱*：地刺、熔岩等向上的危险
- *坠落死亡*：在关卡底部放置大面积的隐藏危险区
- *墙壁陷阱*：墙面上的尖刺
- *移动危险*：（配合其他机制）创建移动的危险区域

#info-box(type: "warning")[
  *坠落死亡区的放置技巧*：
  - 在关卡底部下方适当距离放置一个长条形状
  - 距离不能太远（等待时间过长），也不能太近（爆炸特效会穿帮）
  - 建议距离：关卡底部下方 2 tile
  - 记得使用 `.hide()` 隐藏
]

= *Trigger* 触发器

最灵活的游戏对象，可在玩家进入/离开区域时执行任意自定义函数。

== 构造函数

#api(
  name: "new Trigger(x, y, width, height, triggerOnce, onEnter, onLeave)",
  description: "创建触发器",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
    (name: "width", type: "number", description: "触发区域宽度"),
    (name: "height", type: "number", description: "触发区域高度"),
    (name: "triggerOnce", type: "boolean", description: "是否只触发一次"),
    (name: "onEnter", type: "function", description: "玩家进入时的回调函数"),
    (name: "onLeave", type: "function", description: "玩家离开时的回调函数"),
  ),
  example: ```js
  // 基础触发器：控制移动平台
  new $.Trigger(248, 69, 16, 8, false, (game, $) => {
    $('plat1').set(1)           // 移动平台到终点
    $('t1').r.y += 1            // 触发器自身下沉（踩下按钮效果）
    game.sound.play('item00')   // 播放音效
  }, (game, $) => {
    $('plat1').set(0)           // 恢复平台位置为起点
    $('t1').r.y -= 1            // 恢复触发器位置
    game.sound.play('item00')   // 播放音效
  }).ref('t1')
  
  // 单次触发：设置重生点
  new $.Trigger(296, -80, 8, 288, true, (game, $) => {
    game.levelData.spawnpoint = new Vec2(32, 16)
  }, null).hide()
  
  // 复杂逻辑：多步骤机关
  new $.Trigger(100, 100, 32, 32, false, async (game, $) => {
    // 可以使用异步操作
    game.sound.play('trigger')
    $('door').show()
    
    // 等待一段时间
    await wait(1000)
    
    // 继续执行其他操作
    game.sound.play('door_open')
  }, (game, $) => {
    $('door').hide()
  })
  ```,
)

== 回调函数参数

触发器的回调函数接收两个参数：

#styled-table(
  columns: (1fr, 3fr),
  headers: ([参数], [说明]),
  rows: (
    ([`game`], [游戏实例，提供对游戏所有功能的访问权限]),
    ([`$`], [引用函数，用于快速访问设置了 `.ref()` 的对象]),
  ),
  caption: [触发器回调函数参数],
)

== game 对象常用功能

通过 `game` 参数可以访问游戏的所有功能：

```js
// 音效和音乐
game.sound.play('sound_id')         // 播放音效
game.sound.playBGM('bgm_id')        // 播放背景音乐

// 关卡管理
game.changeLevel('level_name')      // 切换关卡
game.levelData.spawnpoint = new Vec2(x, y)  // 设置重生点

// 摄像机控制
game.camera.shake(intensity)        // 摄像机震动
game.pauseUpdateUntilTick(ticks)    // 暂停游戏更新

// 对象管理
game.gameObjects                    // 所有游戏对象数组
game.ref('object_name')             // 通过名称获取对象

// 停止和启动游戏
game.stop()                         // 暂停游戏（用于对话）
game.start()                        // 恢复游戏
```

== \$ 引用函数

`$` 函数是 `game.ref()` 的简写，用于快速访问对象：

```js
// 两者等价
game.ref('platform')
$('platform')

// 常见用法
$('door').show()                    // 显示门
$('platform').set(1)                // 移动平台
$('trigger').hide()                 // 隐藏触发器
$('enemy').removed = true           // 移除敌人
```

== 实战用例

=== 用例 1：踩下按钮开门

实现一个压力板机关，踩下时门打开，离开时门关闭：

```js
// 创建门（使用移动平台）
new $.MovingPlatform(
  new Vec2(200, 40),    // 关闭位置（低）
  new Vec2(200, 16),    // 打开位置（高）
  24, 24,
  false,
  2,                    // 2秒移动时间
  'still'               // 不自动移动
).ref('door_platform')

// 创建压力板触发器
new $.Trigger(248, 69, 16, 8, false, (game, $) => {
  // 进入：门向上移动
  $('door_platform').set(1)
  game.sound.play('item00')
}, (game, $) => {
  // 离开：门向下关闭
  $('door_platform').set(0)
  game.sound.play('item00')
})
```

=== 用例 2：检查点系统

玩家经过特定区域后，死亡时从该处重生：

```js
// 第一个检查点
new $.Trigger(100, 0, 16, 200, true, (game, $) => {
  game.levelData.spawnpoint = new Vec2(108, 150)
  game.sound.play('checkpoint')
}, null).hide()

// 第二个检查点
new $.Trigger(300, 0, 16, 200, true, (game, $) => {
  game.levelData.spawnpoint = new Vec2(308, 150)
  game.sound.play('checkpoint')
}, null).hide()
```

注意：
- 使用 `triggerOnce = true` 确保只触发一次
- 使用 `.hide()` 隐藏触发器
- `onLeave` 设为 `null` 因为不需要离开事件

=== 用例 3：多阶段机关

创建需要多次触发才能完全开启的机关：

```js
// 假设有三个按钮和一扇大门
let buttonsPressed = 0

new $.Trigger(100, 100, 16, 16, false, (game, $) => {
  if (!this.pressed) {
    this.pressed = true
    buttonsPressed++
    game.sound.play('button')
    
    // 检查是否所有按钮都按下
    if (buttonsPressed >= 3) {
      $('final_door').show()
      game.sound.play('door_open')
    }
  }
}, null).ref('button1')

// 类似地创建 button2 和 button3
```

=== 用例 4：时间限制挑战

进入区域后启动倒计时，限时完成任务：

```js
new $.Trigger(50, 50, 32, 32, true, async (game, $) => {
  game.sound.play('timer_start')
  
  // 启动倒计时
  const timeLimit = 10000  // 10秒
  const startTime = Date.now()
  
  // 等待完成或超时
  const checkInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    if (elapsed > timeLimit) {
      // 时间到：关闭所有门
      clearInterval(checkInterval)
      $('exit_door').hide()
      game.sound.play('timer_fail')
    }
  }, 100)
  
  // 存储到游戏对象中，方便其他触发器访问
  game.challengeTimer = checkInterval
}, null)

// 完成挑战的触发器
new $.Trigger(500, 50, 32, 32, true, (game, $) => {
  if (game.challengeTimer) {
    clearInterval(game.challengeTimer)
    game.sound.play('timer_success')
  }
}, null)
```

=== 用例 5：剧情触发

进入区域时自动播放对话，然后显示隐藏的路径：

```js
new $.Trigger(200, 100, 48, 48, true, async (game, $) => {
  // 暂停游戏并播放对话
  game.stop()
  await Dialogue.play('chapter2_discovery')
  game.start()
  
  // 显示隐藏的平台
  $('hidden_platform1').show()
  $('hidden_platform2').show()
  
  // 播放音效
  game.sound.play('reveal')
}, null).hide()
```

=== 用例 6：敌人刷新区域

进入区域时刷新敌人，离开时清除：

```js
new $.Trigger(300, 0, 100, 200, false, (game, $) => {
  // 进入：刷新敌人
  if (!this.enemiesSpawned) {
    const enemy1 = new $.Enemy(320, 150, 'enemy_type1')
    const enemy2 = new $.Enemy(350, 150, 'enemy_type1')
    game.gameObjects.push(enemy1, enemy2)
    this.enemiesSpawned = true
    this.enemies = [enemy1, enemy2]
  }
}, (game, $) => {
  // 离开：清除敌人
  if (this.enemies) {
    this.enemies.forEach(enemy => enemy.removed = true)
    this.enemiesSpawned = false
  }
})
```

=== 用例 7：摄像机震动效果

玩家进入危险区域时触发摄像机震动：

```js
new $.Trigger(400, 150, 64, 64, false, (game, $) => {
  // 持续震动
  if (!this.shaking) {
    this.shaking = true
    this.shakeInterval = setInterval(() => {
      if (game.camera.shake) {
        game.camera.shake(2)
      }
    }, 100)
  }
}, (game, $) => {
  // 停止震动
  if (this.shakeInterval) {
    clearInterval(this.shakeInterval)
    this.shaking = false
  }
})
```

=== 用例 8：连锁反应

触发一个触发器后，激活其他触发器：

```js
// 主触发器
new $.Trigger(100, 100, 32, 32, true, (game, $) => {
  game.sound.play('chain_start')
  
  // 显示并激活隐藏的触发器
  $('chain_trigger2').show()
  $('chain_trigger3').show()
  
  // 移除自己
  this.removed = true
}, null).ref('chain_trigger1')

// 第二阶段
new $.Trigger(200, 100, 32, 32, true, (game, $) => {
  game.sound.play('chain_continue')
  $('chain_trigger3_target').show()
  this.removed = true
}, null).ref('chain_trigger2').hide()

// 第三阶段
new $.Trigger(300, 100, 32, 32, true, (game, $) => {
  game.sound.play('chain_complete')
  $('final_reward').show()
  this.removed = true
}, null).ref('chain_trigger3').hide()
```

== 设计建议

#info-box(type: "info")[
  触发器设计最佳实践：

  - 状态管理：复杂触发器需要维护状态时，将状态存储在触发器对象自身（`this.xxx`）或游戏对象（`game.xxx`）上
  - 命名规范：为所有相关对象设置清晰的引用名称，如 `door_platform`、`button1`、`trigger_checkpoint`
  - 可见性：纯逻辑触发器应使用 `.hide()` 隐藏，除非需要调试
  - 单次触发：检查点、剧情触发等应使用 `triggerOnce = true`，避免重复触发
  - 音效反馈：几乎所有触发器都应该播放音效，提供反馈
  - 异步操作：需要等待或延时的操作使用 `async/await` 或 `setTimeout`
  - 清理资源：使用定时器或interval时，记得在适当的时机清理（`clearInterval`、`clearTimeout`）
  - 调试技巧：开发时可以在回调中使用 `console.log()` 查看触发状态
]

#info-box(type: "warning")[
  常见陷阱：

  - 不要在触发器中创建新的触发器，容易导致逻辑混乱
  - 避免在 onEnter 和 onLeave 中执行冲突的操作，可能导致状态不一致
  - triggerOnce 为 true 时，回调函数只执行一次后就会被清空，无法重复触发
  - 回调函数中的 this：指向触发器对象本身，可以存储状态
  - 玩家快速穿过触发器：onEnter 和 onLeave 都会触发，即使玩家只在区域内停留一帧
]

= 总结

游戏对象系统提供了丰富的组件来构建关卡：

- 使用 *MovingPlatform* 创建动态地形
- 使用 *Interactable* 添加对话和交互
- 使用 *Trigger* 实现复杂的游戏逻辑
- 使用 *CameraController* 控制镜头效果
- 使用 *Hazard* 增加挑战难度
- 使用 *Collectible* 提供奖励和收集要素

所有对象都支持链式调用和引用系统，可以方便地组合使用，创造出丰富的游戏体验。

#info-box(type: "info")[
  更多示例请参考 `game/script/game2d/level/` 目录下的现有关卡文件，了解实际应用场景。
]
