// ============================================================================
// PauseManager.js 模块文档
// rewind-pearl 游戏引擎 - 暂停管理系统
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "PauseManager.js",
  subtitle: "暂停管理系统",
  authors: ("windlandneko",),
)

= 模块介绍

`PauseManager.js` 是 rewind-pearl 游戏引擎的暂停管理模块，负责游戏暂停状态的控制和暂停菜单的界面管理。该模块提供暂停/恢复游戏、保存/加载存档、显示帮助、返回标题等功能，并与音频系统、键盘输入、存档管理等模块深度集成。

== 核心特性

- *暂停控制*：提供暂停、恢复、切换暂停状态的接口
- *菜单管理*：管理暂停菜单、存档管理器、帮助界面的显示和隐藏
- *事件通知*：通过事件系统通知游戏暂停和恢复，实现解耦
- *键盘交互*：动态管理 ESC 键监听器，支持菜单导航
- *音频集成*：暂停/恢复时自动控制 BGM 和音效
- *存档集成*：无缝对接 SaveManager 实现存档管理
- *单例模式*：全局唯一实例，统一暂停状态管理

== 导入方式

```js
import PauseManager from './PauseManager.js'
```

#info-box(
  type: "warning",
)[
  `PauseManager.js` 导出的是一个已实例化的单例对象（类名为 `PauseManager`），可直接使用，无需 `new` 关键字。
]

= 界面结构

暂停管理器依赖以下 HTML 元素（需在页面中预先定义）：

```html
<!-- 暂停菜单遮罩层 -->
<div id="pause-overlay">
  <div class="pause-menu">
    <h2>游戏已暂停</h2>
    <button id="resume-btn">继续游戏</button>
    <button id="save-btn">保存游戏</button>
    <button id="load-btn">加载存档</button>
    <button id="help-btn">帮助</button>
    <button id="title-btn">返回标题</button>
  </div>
</div>

<!-- 存档管理器模态框 -->
<div id="save-manager-modal">
  <div class="modal-content">
    <span id="save-manager-close">&times;</span>
    <h2>加载存档</h2>
    <div id="save-list"></div>
  </div>
</div>

<!-- 帮助模态框 -->
<div id="help-modal">
  <div class="modal-content">
    <span id="help-close">&times;</span>
    <h2>游戏帮助</h2>
    <div class="help-content">
      <!-- 帮助内容 -->
    </div>
  </div>
</div>
```

= API 参考

== 暂停控制

#api(
  name: "pause()",
  description: [暂停游戏，显示暂停菜单。暂停 BGM 并播放暂停音效，触发 `pause` 事件。],
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import PauseManager from './PauseManager.js'

  // 按 ESC 键暂停游戏
  Keyboard.onKeydown('Esc', () => {
    if (!PauseManager.isPaused) {
      PauseManager.pause()
    }
  })

  // 点击暂停按钮
  pauseButton.addEventListener('click', () => {
    PauseManager.pause()
  })
  ```,
  notes: "如果已经暂停，调用此方法无任何效果。",
)

#api(
  name: "resume()",
  description: [恢复游戏，隐藏暂停菜单。恢复 BGM 播放，触发 `resume` 事件。],
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import PauseManager from './PauseManager.js'

  // 点击继续按钮恢复游戏
  resumeButton.addEventListener('click', () => {
    PauseManager.resume()
  })

  // 在暂停菜单中按 ESC 键恢复
  // (PauseManager 内部自动处理)
  ```,
  notes: "如果未暂停，调用此方法无任何效果。",
)

#api(
  name: "toggle()",
  description: "切换暂停状态。如果当前已暂停则恢复，如果未暂停则暂停。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import PauseManager from './PauseManager.js'

  // 按 P 键切换暂停状态
  Keyboard.onKeydown('P', () => {
    PauseManager.toggle()
  })

  // 游戏手柄按钮
  gamepad.on('start', () => {
    PauseManager.toggle()
  })
  ```,
  notes: "这是实现暂停快捷键的推荐方式。",
)

== 事件监听

#api(
  name: "on(event, listener)",
  description: [注册暂停管理器事件监听器。支持 `'pause'` 和 `'resume'` 事件。],
  parameters: (
    (name: "event", type: "string", description: [事件名称：`'pause'` 或 `'resume'`]),
    (name: "listener", type: "Function", description: "事件触发时的回调函数"),
  ),
  returns: (type: "Function", description: "返回取消监听的函数"),
  example: ```js
  import PauseManager from './PauseManager.js'

  class Game {
    constructor() {
      // 监听暂停事件
      PauseManager.on('pause', () => {
        this.stopGameLoop()
        this.hideGameUI()
      })

      // 监听恢复事件
      PauseManager.on('resume', () => {
        this.startGameLoop()
        this.showGameUI()
      })
    }
  }
  ```,
  notes: "事件监听器会在暂停/恢复时按注册顺序依次执行。",
)

== 界面管理

#api(
  name: "showHelp()",
  description: "显示帮助模态框，并设置 ESC 键处理器为关闭帮助。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import PauseManager from './PauseManager.js'

  // 点击帮助按钮
  helpButton.addEventListener('click', () => {
    PauseManager.showHelp()
  })

  // 在游戏中按 F1 显示帮助
  Keyboard.onKeydown('F1', () => {
    PauseManager.showHelp()
  })
  ```,
  notes: "帮助界面显示时，按 ESC 键会关闭帮助并返回暂停菜单。",
)

== 状态属性

#api(
  name: "isPaused",
  description: "当前游戏是否处于暂停状态。",
  parameters: (),
  returns: (type: "boolean", description: [`true` 表示已暂停，`false` 表示运行中]),
  example: ```js
  import PauseManager from './PauseManager.js'

  // 在游戏主循环中检查
  function gameLoop() {
    if (!PauseManager.isPaused) {
      update()
      render()
    }
    requestAnimationFrame(gameLoop)
  }

  // 条件性暂停
  if (!PauseManager.isPaused && someCondition) {
    PauseManager.pause()
  }
  ```,
  notes: "这是一个公开属性，可以直接读取，但建议通过 API 方法修改状态。",
)

#api(
  name: "game",
  description: [游戏实例的引用，用于调用游戏相关方法（如 `saveGame`、`onSavedExit`）。],
  parameters: (),
  returns: (type: "Object", description: "游戏实例对象"),
  example: ```js
  import PauseManager from './PauseManager.js'

  class Game {
    constructor() {
      // 设置游戏实例引用
      PauseManager.game = this
    }

    saveGame(saveName, silent = false, isAuto = false) {
      // 保存逻辑
    }
  }
  ```,
  notes: "需要在游戏初始化时设置此属性，否则存档和退出功能无法正常工作。",
)

= 内部机制

== ESC 键动态处理

暂停管理器根据当前显示的界面动态设置 ESC 键的行为：

#styled-table(
  columns: (2fr, 3fr),
  headers: ([当前界面], [ESC 键行为]),
  rows: (
    ([暂停菜单], [恢复游戏（调用 `resume()`）]),
    ([存档管理器], [关闭存档管理器，返回暂停菜单]),
    ([帮助界面], [关闭帮助，返回暂停菜单]),
  ),
  caption: [ESC 键动态行为],
)

实现原理：

```js
// 设置 ESC 键处理器
#setEscKeyHandler(handler) {
  this.#clearEscKeyHandler()  // 先清除旧的监听器
  if (handler) {
    this.escKeyHandler = Keyboard.onKeydown('Esc', handler)
  }
}

// 清除 ESC 键处理器
#clearEscKeyHandler() {
  if (this.escKeyHandler) {
    this.escKeyHandler()  // 调用返回的取消函数
    this.escKeyHandler = null
  }
}
```

== 音频控制集成

暂停和恢复时自动控制音频：

```js
pause() {
  // 暂停 BGM
  SoundManager.pauseBGM()

  // 播放暂停音效
  SoundManager.play('pause', { volume: 0.3 })

  // ... 显示菜单
}

resume() {
  // 恢复 BGM
  SoundManager.resumeBGM()

  // ... 隐藏菜单
}
```

== 存档管理集成

加载存档时的流程：

```js
#onLoadGame() {
  const saveList = $('#save-list')
  this.$saveManagerModal?.classList.add('show')

  // 使用 SaveManager 加载存档列表
  SaveManager.loadSaveList(saveList, saveData => {
    const currentUser = localStorage.getItem('rewind-pearl-username')

    // 将选中的存档写入自动存档槽
    localStorage.setItem(
      'rewind-pearl-autosave-' + currentUser,
      JSON.stringify(saveData)
    )

    // 标记为已保存退出，避免重复自动保存
    this.game.onSavedExit = true

    // 刷新页面重新加载游戏
    location.reload()
  })
}
```

= 使用场景与示例

== 场景 1：游戏主循环集成

```js
import PauseManager from './PauseManager.js'

class Game {
  constructor() {
    // 设置游戏实例引用
    PauseManager.game = this

    // 监听暂停/恢复事件
    PauseManager.on('pause', () => {
      console.log('游戏已暂停')
      this.stopPhysics()
    })

    PauseManager.on('resume', () => {
      console.log('游戏已恢复')
      this.startPhysics()
    })
  }

  loop(timestamp) {
    // 暂停时不更新游戏逻辑
    if (!PauseManager.isPaused) {
      this.update(timestamp)
      this.render()
    }

    requestAnimationFrame((t) => this.loop(t))
  }

  saveGame(saveName, silent = false, isAuto = false) {
    // 实现保存逻辑
  }
}
```

== 场景 2：键盘快捷键设置

```js
import PauseManager from './PauseManager.js'
import Keyboard from './Keyboard.js'

class Game {
  #setupKeyboardShortcuts() {
    // ESC 键切换暂停
    Keyboard.onKeydown('Esc', () => {
      if (!PauseManager.isPaused) {
        PauseManager.pause()
      }
    })

    // P 键切换暂停
    Keyboard.onKeydown('P', () => {
      PauseManager.toggle()
    })

    // F1 显示帮助
    Keyboard.onKeydown('F1', () => {
      if (!PauseManager.isPaused) {
        PauseManager.pause()
      }
      PauseManager.showHelp()
    })
  }
}
```

== 场景 3：自定义暂停菜单按钮

```html
<!-- HTML -->
<div id="pause-overlay">
  <div class="pause-menu">
    <h2>游戏已暂停</h2>
    <button id="resume-btn">继续游戏 (ESC)</button>
    <button id="save-btn">保存游戏 (Ctrl+S)</button>
    <button id="load-btn">加载存档 (Ctrl+L)</button>
    <button id="settings-btn">设置</button>
    <button id="help-btn">帮助 (F1)</button>
    <button id="title-btn">返回标题</button>
  </div>
</div>
```

```js
// 添加自定义按钮事件
document.getElementById('settings-btn')?.addEventListener('click', () => {
  showSettingsMenu()
})

// 键盘快捷键
Keyboard.onKeydown('S', () => {
  if (PauseManager.isPaused && Keyboard.isActive('LCtrl')) {
    // Ctrl+S 快速保存
    SaveManager.showSavePrompt(saveName => {
      PauseManager.game.saveGame(saveName)
    })
  }
})
```

== 场景 4：处理多层模态框

```js
import PauseManager from './PauseManager.js'

class ExtendedPauseManager {
  static init() {
    // 存档管理器点击背景关闭
    $('#save-manager-modal')?.addEventListener('click', (event) => {
      if (event.target.id === 'save-manager-modal') {
        this.#hideSaveManagerModal()
      }
    })

    // 帮助界面点击背景关闭
    $('#help-modal')?.addEventListener('click', (event) => {
      if (event.target.id === 'help-modal') {
        this.#hideHelpModal()
      }
    })
  }

  static #hideSaveManagerModal() {
    $('#save-manager-modal')?.classList.remove('show')
    // 恢复 ESC 键为恢复游戏
    PauseManager.#setEscKeyHandler(() => PauseManager.resume())
  }

  static #hideHelpModal() {
    $('#help-modal')?.classList.remove('show')
    PauseManager.#setEscKeyHandler(() => PauseManager.resume())
  }
}
```

== 场景 5：暂停时的粒子效果

```js
import PauseManager from './PauseManager.js'

class ParticleSystem {
  constructor() {
    this.particles = []
    this.isPaused = false

    PauseManager.on('pause', () => {
      this.isPaused = true
      // 可选：冻结粒子
      this.particles.forEach(p => p.freeze())
    })

    PauseManager.on('resume', () => {
      this.isPaused = false
      this.particles.forEach(p => p.unfreeze())
    })
  }

  update(dt) {
    if (this.isPaused) return

    this.particles.forEach(p => p.update(dt))
  }
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 直接修改暂停状态
  PauseManager.isPaused = true
  SoundManager.pauseBGM()
  $('#pause-overlay').classList.add('show')
  ```,
  good: ```js
  // 使用封装的方法
  PauseManager.pause()


  ```,
  explanation: [使用 `pause()` 方法自动处理音频、界面、事件通知等所有相关逻辑。],
)

#best-practice(
  bad: ```js
  // 在多处注册 ESC 键监听
  Keyboard.onKeydown('Esc', () => { /* 处理1 */ })
  Keyboard.onKeydown('Esc', () => { /* 处理2 */ })
  Keyboard.onKeydown('Esc', () => { /* 处理3 */ })
  ```,
  good: ```js
  // 使用 PauseManager 统一管理 ESC 键
  // PauseManager 内部动态设置 ESC 键行为
  PauseManager.pause()  // ESC 键自动切换为恢复
  ```,
  explanation: "让 PauseManager 统一管理 ESC 键行为，避免冲突和内存泄漏。",
)

#best-practice(
  bad: ```js
  // 不设置游戏实例引用
  // 导致存档和退出功能无法使用
  PauseManager.pause()
  ```,
  good: ```js
  // 在游戏初始化时设置
  class Game {
    constructor() {
      PauseManager.game = this
    }
  }
  ```,
  explanation: [必须设置 `game` 属性，否则存档管理和退出功能无法正常工作。],
)

#best-practice(
  bad: ```js
  // 暂停时继续执行游戏逻辑
  function gameLoop() {
    update()
    render()
    requestAnimationFrame(gameLoop)
  }
  ```,
  good: ```js
  // 暂停时跳过游戏逻辑更新
  function gameLoop() {
    if (!PauseManager.isPaused) {
      update()
      render()
    }
    requestAnimationFrame(gameLoop)
  }
  ```,
  explanation: [在主循环中检查 `isPaused` 状态，暂停时跳过游戏逻辑更新。],
)

= 技术细节

#info-box(
  type: "warning",
)[
  - *HTML 元素依赖*：PauseManager 依赖特定 ID 的 HTML 元素（如 `#pause-overlay`、`#save-manager-modal` 等）。确保这些元素在页面中存在，否则会导致功能失效。使用可选链 `?.` 避免报错。
  - *游戏实例引用*：必须在游戏初始化时设置 `PauseManager.game = this`，否则存档保存、加载和退出功能无法正常工作。
  - *页面刷新行为*：加载存档后会调用 `location.reload()` 刷新页面；返回标题前会自动保存游戏（如果 `maxTick` 不为 `null`）；刷新前会设置 `onSavedExit = true` 避免重复自动保存。
]

#info-box(
  type: "info",
)[
  - *ESC 键监听器管理*：PauseManager 内部动态管理 ESC 键监听器，避免在外部重复注册 ESC 键监听，否则可能导致行为冲突。
  - *事件执行顺序*：`pause` 和 `resume` 事件的监听器按注册顺序依次执行。如果有多个模块需要响应暂停/恢复事件，确保注册顺序正确。
  - *模态框关闭*：存档管理器和帮助界面支持三种关闭方式：点击关闭按钮（`×`）、按 ESC 键、点击模态框背景（遮罩层）。
]

== 类结构

```js
export class PauseManager {
  #listener = new EventListener()  // 事件系统

  constructor() {
    this.isPaused = false
    this.game = null
    this.escKeyHandler = null

    // 缓存 DOM 元素
    this.$pauseOverlay = $('#pause-overlay')
    this.$saveManagerModal = $('#save-manager-modal')
    this.$helpModal = $('#help-modal')

    // 绑定按钮事件
    this.#bindButtonEvents()
  }

  // 公共方法
  pause() { /* ... */ }
  resume() { /* ... */ }
  toggle() { /* ... */ }
  on(event, listener) { /* ... */ }
  showHelp() { /* ... */ }

  // 私有方法
  #onSaveGame() { /* ... */ }
  #onLoadGame() { /* ... */ }
  #onReturnToTitle() { /* ... */ }
  #hideSaveManagerModal() { /* ... */ }
  #hideHelpModal() { /* ... */ }
  #setEscKeyHandler(handler) { /* ... */ }
  #clearEscKeyHandler() { /* ... */ }
}

// 导出全局单例
export default new PauseManager()
```

== 事件系统实现

使用 `EventListener` 工具类实现发布-订阅模式：

```js
#listener = new EventListener()

on(event, listener) {
  this.#listener.on(event, listener)
}

pause() {
  // ...
  this.#listener.emit('pause')
}

resume() {
  // ...
  this.#listener.emit('resume')
}
```

== 依赖关系

`PauseManager.js` 依赖以下模块：

- `SaveManager.js`：存档加载和保存
- `SoundManager.js`：音频控制
- `Keyboard.js`：键盘输入管理
- `utils.js`：DOM 查询和事件系统

被以下模块使用：

- `Game2D.js` 或游戏主逻辑：监听暂停/恢复事件，检查暂停状态
- 键盘输入处理：触发暂停操作

== 按钮事件绑定

构造函数中绑定所有按钮事件：

```js
constructor() {
  // ...
  $('#resume-btn')?.addEventListener('click', () => this.resume())
  $('#save-btn')?.addEventListener('click', () => this.#onSaveGame())
  $('#load-btn')?.addEventListener('click', () => this.#onLoadGame())
  $('#help-btn')?.addEventListener('click', () => this.showHelp())
  $('#title-btn')?.addEventListener('click', () => this.#onReturnToTitle())
  $('#help-close')?.addEventListener('click', () => this.#hideHelpModal())
  $('#save-manager-close')?.addEventListener('click', () => this.#hideSaveManagerModal())

  // 点击背景关闭模态框
  this.$saveManagerModal?.addEventListener('click', event => {
    if (event.target === this.$saveManagerModal) this.#hideSaveManagerModal()
  })
  this.$helpModal?.addEventListener('click', event => {
    if (event.target === this.$helpModal) this.#hideHelpModal()
  })
}
```

== 返回标题逻辑

```js
#onReturnToTitle() {
  // 如果游戏有进度，自动保存
  if (this.game?.maxTick !== null) {
    this.game.saveGame('自动保存', true, true)
  }

  // 标记为已保存退出
  this.game.onSavedExit = true

  // 跳转到主页
  location.assign('../index.html')
}
```

保证玩家退出时不会丢失进度，同时避免重复自动保存。

== CSS 类控制

使用 CSS 类 `show` 控制界面显示：

```css
#pause-overlay,
#save-manager-modal,
#help-modal {
  display: none;
}

#pause-overlay.show,
#save-manager-modal.show,
#help-modal.show {
  display: flex;
}
```

JavaScript 中切换类：

```js
this.$pauseOverlay.classList.add('show')      // 显示
this.$pauseOverlay.classList.remove('show')   // 隐藏
```
