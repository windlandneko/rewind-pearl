// ============================================================================
// Keyboard.js 模块文档
// rewind-pearl 游戏引擎 - 键盘输入管理系统
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "Keyboard.js",
  subtitle: "键盘输入管理系统",
  authors: ("windlandneko", "ri-nai"),
)

= 模块介绍

`Keyboard.js` 是 rewind-pearl 游戏引擎的键盘输入管理模块，提供了统一的键盘事件监听和状态查询接口。该模块将原生的 `KeyboardEvent.code` 映射为简洁易用的按键名称，并提供事件驱动和轮询两种输入处理方式。

== 核心特性

- *按键映射*：将原生按键代码（如 `KeyA`、`ArrowUp`）映射为简洁名称（如 `A`、`Up`）
- *事件驱动*：支持按键按下（`keydown`）和松开（`keyup`）事件监听
- *状态查询*：提供实时按键状态查询，支持单键、多键组合判断
- *自动重置*：窗口失焦时自动重置所有按键状态，避免状态残留
- *单例模式*：全局唯一实例，确保状态一致性

== 导入方式

```js
import Keyboard from './Keyboard.js'
```

#info-box(
  type: "warning",
)[
  `Keyboard.js` 导出的是一个已实例化的单例对象，可直接使用，无需 `new` 关键字。
]

= 支持的按键

模块支持以下按键类型，完整列表见源码 `KEYMAP` 定义：

#styled-table(
  columns: (1fr, 2fr, 3fr),
  headers: ([类别], [映射名称示例], [说明]),
  rows: (
    ([字母键], [`A`-`Z`], [26个字母，大写表示]),
    ([数字键], [`0`-`9`], [主键盘区数字]),
    ([方向键], [`Up`, `Down`, `Left`, `Right`], [四个方向键]),
    ([功能键], [`F1`-`F12`, `Esc`, `Enter`, `Space`], [常用功能键]),
    ([修饰键], [`LShift`, `RShift`, `LCtrl`, `RCtrl`, `LAlt`, `RAlt`], [左右修饰键区分]),
    ([小键盘], [`NUMPAD0`-`NUMPAD9`, `Add`, `Sub`, `Mul`, `Div`], [数字小键盘]),
    ([其他], [`Backspace`, `Tab`, `Delete`, `Home`, `End`, `Page Up`, `Page Down`], [编辑和导航键]),
  ),
  caption: [支持的按键类型],
)

#info-box(
  type: "warning",
)[
  在调用 API 时使用映射后的名称，而非原生代码（如 `KeyA`、`Space`、`ArrowUp`）。
]

= API 参考

== 事件监听

#api(
  name: "onKeydown(key, callback)",
  description: "注册按键按下事件监听器。当指定按键首次按下时触发回调（不重复触发，直到松开后再按下）。",
  parameters: (
    (
      name: "key",
      type: "string | string[]",
      description: "按键名称或按键名称数组。支持单个按键或多个按键绑定到同一回调",
    ),
    (name: "callback", type: "Function", description: "按键按下时的回调函数，接收按键名称作为参数"),
  ),
  returns: (type: "Function", description: "返回取消监听的函数，调用后移除该监听器"),
  example: ```js
  // 单个按键
  const remove = Keyboard.onKeydown('E', (key) => {
    console.log(`按下了 ${key} 键`)
  })

  // 多个按键绑定到同一回调
  Keyboard.onKeydown(['Q', 'E'], (key) => {
    console.log(`按下了 ${key} 键`)
  })

  // 取消监听
  remove()
  ```,
  notes: "多次快速按下同一按键只会触发一次回调，直到完全松开后再按下才会再次触发。",
)

#api(
  name: "onKeyup(key, callback)",
  description: "注册按键松开事件监听器。当指定按键松开时触发回调。",
  parameters: (
    (name: "key", type: "string | string[]", description: "按键名称或按键名称数组"),
    (name: "callback", type: "Function", description: "按键松开时的回调函数，接收按键名称作为参数"),
  ),
  returns: (type: "Function", description: "返回取消监听的函数，调用后移除该监听器"),
  example: ```js
  Keyboard.onKeyup('Space', () => {
    console.log('空格键松开')
  })

  Keyboard.onKeyup(['Q', 'E'], () => {
    console.log('Q 或 E 松开')
  })
  ```,
)

== 状态查询

#api(
  name: "isActive(key)",
  description: "查询指定按键当前是否处于按下状态。",
  parameters: (
    (name: "key", type: "string", description: "按键名称"),
  ),
  returns: (type: "boolean", description: [`true` 表示按键当前按下，`false` 表示未按下]),
  example: ```js
  if (Keyboard.isActive('Space')) {
    console.log('空格键正在被按下')
  }
  ```,
  notes: "适合在游戏主循环中实时查询按键状态，如角色移动控制。",
)

#api(
  name: "allActive(...keys)",
  description: "查询多个按键是否*全部*处于按下状态（逻辑与）。",
  parameters: (
    (name: "...keys", type: "string[]", description: "可变参数，多个按键名称"),
  ),
  returns: (type: "boolean", description: [所有按键都按下时返回 `true`，否则返回 `false`]),
  example: ```js
  // 检查 Q 和 E 是否同时按下
  if (Keyboard.allActive('Q', 'E')) {
    console.log('组合键：Q + E')
  }
  ```,
  notes: "常用于组合键检测，如技能释放、快捷操作等。",
)

#api(
  name: "anyActive(...keys)",
  description: "查询多个按键是否有*任意一个*处于按下状态（逻辑或）。",
  parameters: (
    (name: "...keys", type: "string[]", description: "可变参数，多个按键名称"),
  ),
  returns: (type: "boolean", description: [任意按键按下时返回 `true`，全部未按下时返回 `false`]),
  example: ```js
  // 检查 A 或 左方向键 是否按下
  if (Keyboard.anyActive('A', 'Left')) {
    console.log('向左移动')
  }
  ```,
  notes: "常用于多键位替代，如 WASD 和方向键同时支持。",
)

= 使用场景与示例

== 场景 1：游戏角色移动控制

在游戏主循环中查询按键状态，实现实时移动控制。

```js
// Player.js 中的 processInputEvents 方法
processInputEvents(dt, game) {
  // 支持 WASD 和方向键
  const keyLeft = Keyboard.anyActive('A', 'Left')
  const keyRight = Keyboard.anyActive('D', 'Right')
  const keyDown = Keyboard.anyActive('S', 'Down')
  const keyJump = Keyboard.anyActive('Space')

  if (keyLeft && !keyRight) {
    this.inputState |= InputEnum.WALK_LEFT
  } else if (keyRight && !keyLeft) {
    this.inputState |= InputEnum.WALK_RIGHT
  }

  if (keyJump) {
    this.inputState |= InputEnum.JUMP_DOWN
  }
}
```

#info-box(
  title: "状态查询 vs 事件监听",
  type: "info",
)[
  移动控制使用*状态查询*（`isActive`/`anyActive`）而非事件监听，因为需要在每帧检测持续按下的状态，而非单次触发。
]

== 场景 2：单次触发操作

使用事件监听实现按键按下时执行一次的操作，如交互、暂停、技能释放。

```js
// Game2D.js 中的键盘监听
Keyboard.onKeydown('E', async () => {
  this.player.inputState |= InputEnum.INTERACT  // 交互
})

Keyboard.onKeydown('Esc', () => {
  PauseManager.pause()  // 暂停游戏
})

Keyboard.onKeydown('R', () => {
  this.player.onDamage()  // 重置角色（调试用）
})

Keyboard.onKeydown('M', () => {
  this.#debugExportCanvasImage()  // 导出画面（调试用）
})
```

== 场景 3：组合键检测

使用 `allActive` 检测组合键，实现特殊功能。

```js
// 同时按下 Q 和 E 触发时间旅行预览
Keyboard.onKeydown(['Q', 'E'], () => {
  if (Keyboard.allActive('Q', 'E') && this.player.onGround) {
    TimeTravel.startTimeTravelPreview(this)
  }
})

// 松开任意一个键时结束预览
Keyboard.onKeyup(['Q', 'E'], () => {
  if (!Keyboard.anyActive('Q', 'E')) {
    TimeTravel.endTimeTravelPreview(this)
  }
})
```

#info-box(
  title: "组合键实现思路",
  type: "success",
)[
  1. 使用 `onKeydown` 监听多个按键的按下事件
  2. 在回调中用 `allActive` 检测所有按键是否同时按下
  3. 使用 `onKeyup` 监听松开事件，用 `anyActive` 检测是否还有按键按下
]

== 场景 4：取消监听器

在组件销毁或场景切换时，取消已注册的监听器以避免内存泄漏。

```js
class Game2D {
  #keyboardListeners = []

  #addKeyboardListeners() {
    // 将返回的取消函数存储到数组
    this.#keyboardListeners.push(
      Keyboard.onKeydown('E', callback),
      Keyboard.onKeydown('Esc', callback),
      Keyboard.onKeydown('Space', callback)
    )
  }

  #removeKeyboardListeners() {
    // 批量取消所有监听器
    this.#keyboardListeners.forEach(remove => remove())
    this.#keyboardListeners.length = 0
  }

  destroy() {
    this.#removeKeyboardListeners()
  }
}
```

== 场景 5：多键位替代

使用 `anyActive` 支持多个键位实现同一功能，提升用户体验。

```js
// 支持多种跳跃键
const wantsJump = Keyboard.anyActive('Space', 'W', 'Up')
// 支持多种交互键
const wantsInteract = Keyboard.anyActive('E', 'Enter', 'F')

// 支持多种暂停键
Keyboard.onKeydown(['Esc', 'P'], () => {
  PauseManager.pause()
})
```

= 最佳实践

#best-practice(
  bad: ```js
  Keyboard.onKeydown('Space', () => {
    player.jump()
  })
  ```,
  good: ```js
  if (Keyboard.isActive('Space')) {
    player.jump()
  }


  ```,
  explanation: "主循环中应使用状态查询而非事件监听，避免重复注册监听器导致内存泄漏和逻辑错误。",
)

#best-practice(
  bad: ```js
  Keyboard.onKeydown('E', callback)




  ```,
  good: ```js
  const removeListener = Keyboard.onKeydown('E', callback)
  // 场景销毁时调用
  removeListener()
  ```,
  explanation: "始终保存监听器的取消函数，在组件销毁或场景切换时调用，避免按键冲突。",
)

#best-practice(
  bad: ```js
  // 使用原生按键代码
  Keyboard.isActive('KeyA')
  Keyboard.onKeydown('ArrowUp', () => {})
  ```,
  good: ```js
  // 使用映射后的按键名称
  Keyboard.isActive('A')
  Keyboard.onKeydown('Up', () => {})


  ```,
  explanation: "使用模块提供的映射名称（参见\"支持的按键\[一节），而非原生 `KeyboardEvent.code`。],
)

= 技术细节

#info-box(
  type: "warning",
)[
  当窗口失去焦点时，所有按键状态会自动重置为未按下，并触发对应的 `keyup` 事件。这是为了避免用户切换窗口时按键状态残留导致的游戏逻辑错误。
]

#info-box(
  type: "info",
)[
  - 当用户按下或松开 `KEYMAP` 中未定义的按键时，控制台会输出警告信息。如需支持更多按键，请在 `KEYMAP` 中添加映射。
  - 只有已绑定监听器的按键会阻止浏览器默认行为（`preventDefault`），未绑定的按键不受影响。这确保了输入框等元素的正常使用。
]

== 内部实现

- *按键状态记录*：使用私有 `Map` 存储每个按键的按下/松开状态
- *事件去重*：通过状态记录实现按键按下事件的去重，避免长按时重复触发
- *事件系统*：基于 `EventListener` 工具类实现发布-订阅模式
- *窗口失焦处理*：监听 `blur` 事件，重置所有按键状态并触发 `keyup` 事件

== 依赖

```js
import { EventListener } from './utils.js'
```

`Keyboard.js` 依赖 `utils.js` 中的 `EventListener` 类实现事件管理。
