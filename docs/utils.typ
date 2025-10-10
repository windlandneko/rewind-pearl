// ============================================================================
// utils.js 模块文档
// rewind-pearl 游戏引擎 - 工具函数与事件系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "utils.js 文档",
  subtitle: "工具函数与事件系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`utils.js` 是 rewind-pearl 游戏引擎的基础工具模块，提供了常用的 DOM 操作快捷函数、异步控制工具、函数式编程辅助函数以及轻量级的事件发布-订阅系统。该模块被项目中的多个核心模块依赖，是整个引擎架构的基石之一。

== 核心特性

- *DOM 快捷操作*：简化 DOM 查询，减少代码冗余
- *异步控制*：提供 Promise 风格的延时等待工具
- *函数防抖与节流*：优化高频事件处理性能
- *事件系统*：轻量级发布-订阅模式实现，支持一次性监听
- *哈希函数*：提供 2D 空间坐标的哈希映射功能

== 导入方式

```js
// 导入所有工具
import { $, $$, wait, throttle, debounce, EventListener, hash2D } from './utils.js'

// 按需导入
import { $, EventListener } from './utils.js'
```

#info-box(
  type: "info",
)[
  `utils.js` 导出的都是独立函数和类，无全局状态。`EventListener` 需要实例化后使用。
]

= API 参考

== DOM 操作

#api(
  name: "$(selector)",
  description: [快捷查询单个 DOM 元素，是 `document.querySelector` 的简写形式。],
  parameters: (
    (name: "selector", type: "string", description: "CSS 选择器字符串"),
  ),
  returns: (type: "Element | null", description: [匹配的第一个元素，未找到则返回 `null`]),
  example: ```js
  const pauseOverlay = $('#pause-overlay')
  const saveBtn = $('#save-btn')
  
  pauseOverlay.classList.add('show')
  ```,
  notes: [使用时需保证元素存在，或使用可选链操作符 `?.`。],
)

#api(
  name: "$$(selector)",
  description: [快捷查询多个 DOM 元素，是 `document.querySelectorAll` 的简写形式。],
  parameters: (
    (name: "selector", type: "string", description: "CSS 选择器字符串"),
  ),
  returns: (type: "NodeList", description: "匹配的元素集合（类数组对象）"),
  example: ```js
  const buttons = $$('.menu-btn')
  buttons.forEach(btn => {
    btn.addEventListener('click', handleClick)
  })
  ```,
  notes: [返回的 `NodeList` 是静态集合，不会随 DOM 变化而更新。],
)

== 异步控制

#api(
  name: "wait(ms)",
  description: "返回一个延时指定毫秒数的 Promise。",
  parameters: (
    (name: "ms", type: "number", description: "需要的延时毫秒数"),
  ),
  returns: (type: "Promise<void>", description: "延时后 resolve 的 Promise"),
  example: ```js
  // 在异步函数中使用
  async function showMessage() {
    console.log('开始')
    await wait(2000)  // 等待 2 秒
    console.log('结束')
  }
  
  // 链式调用
  wait(1000).then(() => {
    console.log('1 秒后执行')
  })
  ```,
  notes: [常用于动画、对话系统的节奏控制，替代 `setTimeout` 的回调地狱。],
)

== 函数式编程工具

#api(
  name: "throttle(func, interval)",
  description: "创建一个节流函数，限制目标函数在指定时间间隔内最多执行一次。首次调用立即执行，后续调用在间隔时间内被忽略。",
  parameters: (
    (name: "func", type: "Function", description: "需要节流的函数"),
    (name: "interval", type: "number", description: "节流时间间隔（毫秒）"),
  ),
  returns: (type: "Function", description: "返回节流后的新函数，调用签名与原函数相同"),
  example: ```js
  // 限制滚动事件处理频率
  const handleScroll = throttle(() => {
    console.log('处理滚动')
  }, 200)
  
  window.addEventListener('scroll', handleScroll)
  
  // 限制游戏状态更新频率
  const updateStatus = throttle((status) => {
    game.updateUI(status)
  }, 100)
  ```,
  notes: [适用于高频事件（如 `scroll`、`resize`、`mousemove`）的性能优化。首次调用立即执行。],
)

#api(
  name: "debounce(func, delay)",
  description: "创建一个防抖函数，延迟执行目标函数直到连续调用停止指定时间后。每次新调用会重置计时器。",
  parameters: (
    (name: "func", type: "Function", description: "需要防抖的函数"),
    (name: "delay", type: "number", description: "防抖延迟时间（毫秒）"),
  ),
  returns: (type: "Function", description: "返回防抖后的新函数，调用签名与原函数相同"),
  example: ```js
  // 搜索输入防抖
  const handleSearch = debounce((query) => {
    console.log('搜索:', query)
    performSearch(query)
  }, 500)
  
  input.addEventListener('input', (e) => {
    handleSearch(e.target.value)
  })
  
  // 窗口大小调整防抖
  const handleResize = debounce(() => {
    game.resize()
  }, 300)
  
  window.addEventListener('resize', handleResize)
  ```,
  notes: "适用于需要等待用户操作完成后才执行的场景，如搜索框输入、窗口调整。",
)

== EventListener 类

`EventListener` 是一个轻量级的事件发布-订阅系统实现，支持多对多的事件通信。

#api(
  name: "new EventListener()",
  description: "创建一个新的事件监听器实例。每个实例独立管理自己的事件和监听器。",
  parameters: (),
  returns: (type: "EventListener", description: "事件监听器实例"),
  example: ```js
  class Game {
    #listener = new EventListener()
    
    start() {
      this.#listener.emit('game:start')
    }
  }
  ```,
  notes: "推荐作为类的私有成员使用，避免外部直接操作。",
)

#api(
  name: "on(event, callback)",
  description: "注册持久性事件监听器，每次事件触发时都会执行回调函数。",
  parameters: (
    (name: "event", type: "string", description: "事件名称"),
    (name: "callback", type: "Function", description: "事件触发时的回调函数，接收事件参数"),
  ),
  returns: (type: "Function", description: "返回取消监听的函数，调用后移除该监听器"),
  example: ```js
  const listener = new EventListener()
  
  // 注册监听器
  const remove = listener.on('data:update', (data) => {
    console.log('数据更新:', data)
  })
  
  // 触发事件
  listener.emit('data:update', { value: 42 })
  
  // 取消监听
  remove()
  ```,
  notes: "同一事件可注册多个监听器，按注册顺序依次执行。",
)

#api(
  name: "once(event, callback)",
  description: "注册一次性事件监听器，触发一次后自动移除。",
  parameters: (
    (name: "event", type: "string", description: "事件名称"),
    (name: "callback", type: "Function", description: "事件触发时的回调函数"),
  ),
  returns: (type: "Function", description: "返回取消监听的函数，可在触发前手动移除"),
  example: ```js
  const listener = new EventListener()
  
  // 注册一次性监听器
  listener.once('game:ready', () => {
    console.log('游戏已准备好')
  })
  
  // 第一次触发会执行
  listener.emit('game:ready')
  
  // 第二次触发不会执行（已自动移除）
  listener.emit('game:ready')
  ```,
  notes: "适用于初始化、资源加载完成等只需响应一次的事件。",
)

#api(
  name: "emit(event, ...args)",
  description: "触发指定事件，按注册顺序依次调用所有监听器，并传递参数。",
  parameters: (
    (name: "event", type: "string", description: "事件名称"),
    (name: "...args", type: "any[]", description: "传递给监听器的参数（可变参数）"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  const listener = new EventListener()
  
  listener.on('player:move', (x, y, direction) => {
    console.log(`玩家移动到 (${x}, ${y})，方向：${direction}`)
  })
  
  // 触发事件并传递多个参数
  listener.emit('player:move', 100, 200, 'right')
  ```,
  notes: [如果没有注册该事件的监听器，调用 `emit` 不会有任何效果。],
)

#api(
  name: "isEmpty(event)",
  description: "检查指定事件是否没有任何监听器。",
  parameters: (
    (name: "event", type: "string", description: "事件名称"),
  ),
  returns: (type: "boolean", description: [`true` 表示没有监听器，`false` 表示至少有一个监听器]),
  example: ```js
  const listener = new EventListener()
  
  console.log(listener.isEmpty('test'))  // true
  
  listener.on('test', () => {})
  console.log(listener.isEmpty('test'))  // false
  ```,
  notes: [可用于判断是否需要触发事件，避免不必要的 `emit` 调用。],
)

== 哈希工具

#api(
  name: "hash2D(i, j, n)",
  description: "将二维坐标映射为 0 到 n-1 范围内的哈希值，用于随机数生成、纹理选择等场景。",
  parameters: (
    (name: "i", type: "number", description: "第一个坐标分量（如 x 坐标）"),
    (name: "j", type: "number", description: "第二个坐标分量（如 y 坐标）"),
    (name: "n", type: "number", description: "哈希值范围上限（返回值在 [0, n-1]）"),
  ),
  returns: (type: "number", description: "范围在 [0, n-1] 内的整数哈希值"),
  example: ```js
  // 为网格中的每个格子选择纹理
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const textureIndex = hash2D(i, j, 4)  // 0-3
      drawTexture(i, j, textures[textureIndex])
    }
  }
  
  // 生成伪随机地形
  const tileType = hash2D(x, y, tileTypes.length)
  ```,
  notes: "基于位运算实现，确保相同坐标总是返回相同值。适合伪随机的场景。",
)

= 使用场景与示例

== 场景 1：暂停管理器中的 DOM 操作

`PauseManager.js` 使用 `$` 快速查询 UI 元素。

```js
import { $, EventListener } from './utils.js'

export class PauseManager {
  #listener = new EventListener()
  
  constructor() {
    // 快速查询 DOM 元素
    this.$pauseOverlay = $('#pause-overlay')
    this.$saveManagerModal = $('#save-manager-modal')
    this.$helpModal = $('#help-modal')
    
    // 绑定事件
    $('#resume-btn')?.addEventListener('click', () => this.resume())
    $('#save-btn')?.addEventListener('click', () => this.#onSaveGame())
  }
  
  pause() {
    this.$pauseOverlay.classList.add('show')
    this.#listener.emit('pause')
  }
}
```

== 场景 2：异步对话系统

`Dialogue.js` 使用 `wait` 控制对话显示节奏。

```js
import { wait } from './utils.js'

class Dialogue {
  async showText(text, duration = 2000) {
    this.display(text)
    await wait(duration)  // 等待指定时间
    this.hide()
  }
  
  async playSequence(lines) {
    for (const line of lines) {
      await this.showText(line.text, line.duration)
      await wait(500)  // 行间停顿
    }
  }
}
```

== 场景 3：事件驱动的游戏架构

多个模块使用 `EventListener` 进行解耦通信。

```js
import { EventListener } from './utils.js'

// 暂停管理器
class PauseManager {
  #listener = new EventListener()
  
  on(event, callback) {
    return this.#listener.on(event, callback)
  }
  
  pause() {
    this.isPaused = true
    this.#listener.emit('pause')
  }
  
  resume() {
    this.isPaused = false
    this.#listener.emit('resume')
  }
}

// 游戏主循环
class Game {
  constructor() {
    // 监听暂停/恢复事件
    PauseManager.on('pause', () => {
      this.stopGameLoop()
    })
    
    PauseManager.on('resume', () => {
      this.startGameLoop()
    })
  }
}
```

== 场景 4：高频事件优化

使用 `throttle` 和 `debounce` 优化性能。

```js
import { throttle, debounce } from './utils.js'

// 节流：限制游戏状态更新频率
const updateStatus = throttle((status) => {
  UI.updateHealthBar(status.health)
  UI.updateScore(status.score)
}, 100)  // 每 100ms 最多更新一次

gameLoop(() => {
  updateStatus(player.getStatus())
})

// 防抖：窗口大小调整完成后重新布局
const handleResize = debounce(() => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  game.resize()
}, 300)  // 停止调整 300ms 后执行

window.addEventListener('resize', handleResize)
```

== 场景 5：一次性初始化事件

使用 `once` 监听只触发一次的事件。

```js
import { EventListener } from './utils.js'

class Game {
  #listener = new EventListener()
  
  constructor() {
    // 资源加载完成后只执行一次
    this.#listener.once('assets:loaded', () => {
      this.startGame()
      console.log('游戏启动')
    })
  }
  
  async loadAssets() {
    await Asset.loadFromManifest('./assets/')
    this.#listener.emit('assets:loaded')
  }
}
```

= 最佳实践

#best-practice(
  bad: ```js
  const btn = document.querySelector('#save-btn')
  const overlay = document.querySelector('#pause-overlay')
  const modal = document.querySelector('#help-modal')
  ```,
  good: ```js
  import { $ } from './utils.js'
  
  const btn = $('#save-btn')
  const overlay = $('#pause-overlay')
  const modal = $('#help-modal')




  ```,
  explanation: [使用 `$` 简化 DOM 查询，减少代码冗余，提高可读性。],
)

#best-practice(
  bad: ```js
  setTimeout(() => {
    console.log('延时执行')
  }, 1000)




  ```,
  good: ```js
  import { wait } from './utils.js'
  
  async function run() {
    await wait(1000)
    console.log('延时执行')
  }
  ```,
  explanation: [使用 `wait` 替代 `setTimeout`，支持 `async/await` 语法，避免回调嵌套。],
)

#best-practice(
  bad: ```js
  addEventListener('scroll', () => {
    // 滚动时每次都执行，性能差
    updateUI()
  })






  ```,
  good: ```js
  import { throttle } from './utils.js'
  
  const handleScroll = throttle(() => {
    updateUI()
  }, 100)
  
  addEventListener('scroll', handleScroll)
  ```,
  explanation: [使用 `throttle` 限制高频事件的执行频率，提升性能。],
)

#best-practice(
  bad: ```js
  input.addEventListener('input', () => {
    // 每次输入都触发搜索
    performSearch(input.value)
  })





  ```,
  good: ```js
  import { debounce } from './utils.js'
  
  const handleInput = debounce(() => {
    performSearch(input.value)
  }, 500)
  
  input.addEventListener('input', handleInput)
  ```,
  explanation: [使用 `debounce` 延迟执行，等待用户输入完成后再触发操作。],
)

= 技术细节

#info-box(
  type: "warning",
)[
  - *DOM 查询*：使用 `$` 和 `$$` 查询元素时，始终检查返回值是否为 `null`，避免在元素不存在时调用方法导致错误。推荐使用可选链操作符 `?.`。
  - *EventListener 内存管理*：使用 `on` 和 `once` 注册监听器后，务必在组件销毁时调用返回的取消函数，避免内存泄漏。
]

#info-box(
  type: "info",
)[
  - *节流与防抖的选择*：节流（throttle）适用于需要持续响应但限制频率的场景，如滚动、鼠标移动、游戏状态更新，首次调用立即执行；防抖（debounce）适用于需要等待操作完成后执行的场景，如搜索输入、窗口调整，延迟执行并连续调用会重置计时器。
  - *hash2D 的确定性*：`hash2D` 基于位运算实现，相同的输入总是返回相同的输出。适合需要可重现随机性的场景（如程序化生成），但不适合密码学或安全相关的应用。
]

== 依赖关系

`utils.js` 不依赖任何其他模块，是项目的基础依赖。被以下模块使用：

- `Keyboard.js`：使用 `EventListener` 实现按键事件系统
- `PauseManager.js`：使用 `$` 和 `EventListener` 进行 DOM 操作和事件管理
- `SoundManager.js`：可能使用 `EventListener` 进行音频事件通知
- `AchievementManager.js`：可能使用 `EventListener` 通知成就解锁
- `Dialogue.js`：使用 `wait` 控制对话节奏

== 代码约定

- 所有导出的函数和类都使用命名导出，便于按需导入和 tree-shaking
- `EventListener` 的内部状态使用私有字段（`#`）封装，防止外部直接访问
- 工具函数保持纯函数特性（除 DOM 操作外），不维护全局状态
