// ============================================================================
// Loading.js 模块文档
// rewind-pearl 游戏引擎 - 加载界面管理系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "Loading.js 文档",
  subtitle: "加载界面管理系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`Loading.js` 是 rewind-pearl 游戏引擎的加载界面管理模块，负责在游戏启动时显示加载进度、处理资源加载错误、提供用户交互选项（重试、跳过）并在加载完成后通知游戏主逻辑。该模块与 `Asset.js` 深度集成，提供友好的资源加载体验。

== 核心特性

- *进度显示*：实时显示资源加载进度和当前加载文件
- *错误处理*：捕获并显示加载失败的资源列表
- *用户交互*：提供重试和跳过加载选项
- *事件通知*：加载完成后触发 `complete` 事件
- *淡入淡出*：平滑的加载界面显示和隐藏动画
- *调试模式*：支持跳过资源加载以加快调试
- *单例模式*：全局唯一实例，统一加载状态管理

== 导入方式

```js
import Loading from './Loading.js'
```

#info-box(
  title: "注意",
  type: "warning",
)[
  `Loading.js` 导出的是一个已实例化的单例对象（类名为 `Loading`），可直接使用，无需 `new` 关键字。
]

= 界面结构

加载管理器依赖以下 HTML 元素（需在页面中预先定义）：

```html
<div class="loading-container">
  <!-- 加载进度条 -->
  <div class="loading-progress">
    <div class="loading-progress-fill"></div>
  </div>
  
  <!-- 加载状态文本 -->
  <div class="loading-status">正在加载资源...</div>
  
  <!-- 错误信息容器 -->
  <div class="loading-error hidden">
    <!-- 错误消息会动态添加到这里 -->
  </div>
  
  <!-- 操作按钮 -->
  <div class="loading-action hidden">
    <button id="loading-retry">重试</button>
    <button id="loading-skip">跳过加载</button>
  </div>
</div>
```

= API 参考

#api(
  name: "on(event, callback)",
  description: [注册加载事件监听器。目前支持 `'complete'` 事件，在加载完成后触发。],
  parameters: (
    (name: "event", type: "string", description: [事件名称，目前仅支持 `'complete'`]),
    (name: "callback", type: "Function", description: "事件触发时的回调函数"),
  ),
  returns: (type: "Function", description: "返回取消监听的函数"),
  example: ```js
  import Loading from './Loading.js'
  
  // 监听加载完成事件
  Loading.on('complete', () => {
    console.log('资源加载完成，开始游戏')
    startGame()
  })
  
  // 也可以取消监听
  const remove = Loading.on('complete', callback)
  remove()  // 取消监听
  ```,
  notes: [通常在 `main.js` 中监听 `complete` 事件以启动游戏主逻辑。],
)

#api(
  name: "init(skipAssetLoading)",
  description: "初始化并开始资源加载流程。显示加载界面，加载 manifest 中的所有资源，处理加载进度和错误。",
  parameters: (
    (name: "skipAssetLoading", type: "boolean", optional: true, description: [是否跳过资源加载（默认 `false`）。调试模式下可设为 `true`]),
  ),
  returns: (type: "Promise<void>", description: "返回 Promise，加载完成后 resolve"),
  example: ```js
  import Loading from './Loading.js'
  
  // 正常启动（加载所有资源）
  Loading.on('complete', () => {
    Game2D.start()
  })
  Loading.init()
  
  // 调试模式（跳过加载）
  if (debugMode) {
    Loading.init(true)
  }
  ```,
  notes: [此方法会捕获加载错误并显示操作按钮（重试/跳过）。加载成功后会自动隐藏加载界面并触发 `complete` 事件。],
)

#api(
  name: "hide()",
  description: "隐藏加载界面并添加淡出动画，然后从 DOM 中移除加载容器。",
  parameters: (),
  returns: (type: "Promise<void>", description: "返回 Promise，动画完成后 resolve"),
  example: ```js
  import Loading from './Loading.js'
  
  // 手动隐藏加载界面
  await Loading.hide()
  console.log('加载界面已隐藏')
  
  // 通常由 init() 方法自动调用
  ```,
  notes: [此方法会等待 300ms 动画完成后再移除 DOM 元素。通常由 `init()` 自动调用，无需手动使用。],
)

#api(
  name: "updateProgress(progressData)",
  description: [更新加载进度显示和状态文本。由 `Asset.loadFromManifest` 的进度回调自动调用。],
  parameters: (
    (name: "progressData", type: "Object", description: "进度数据对象"),
    (name: "progressData.type", type: "string", description: [事件类型：`'completed'`（完成）或 `'failed'`（失败）]),
    (name: "progressData.count", type: "number", description: "已处理的资源数量"),
    (name: "progressData.errorCount", type: "number", description: "加载失败的资源数量"),
    (name: "progressData.total", type: "number", description: "总资源数量"),
    (name: "progressData.current", type: "string", description: "当前加载的资源路径"),
    (name: "progressData.error", type: "Error", optional: true, description: [错误对象（仅在 `type === 'failed'` 时存在）]),
  ),
  returns: (type: "void", description: "无返回值"),
  example: ```js
  // 通常由 Asset.loadFromManifest 自动调用
  await Asset.loadFromManifest('assets/', (data) => {
    Loading.updateProgress(data)
  })
  
  // 进度数据示例
  {
    type: 'completed',
    count: 15,
    errorCount: 0,
    total: 50,
    current: 'background/home.png'
  }
  
  // 错误数据示例
  {
    type: 'failed',
    count: 16,
    errorCount: 1,
    total: 50,
    current: 'audio/missing.mp3',
    error: Error('Failed to load audio')
  }
  ```,
  notes: [进度条宽度自动根据 `count/total` 计算。错误信息会累积显示在错误容器中。],
)

= 加载流程

== 完整加载流程图

```
用户打开游戏
    ↓
Loading.init()
    ↓
显示加载界面（progress: 0%）
    ↓
Asset.loadFromManifest('assets/', updateProgress)
    ↓ (每个文件)
updateProgress() 更新进度条和状态文本
    ↓
所有资源加载完成或失败
    ↓
成功：hide() → emit('complete') → 开始游戏
失败：显示错误和操作按钮（重试/跳过）
```

== 加载状态文本显示逻辑

#styled-table(
  columns: (1fr, 2fr, 2fr),
  headers: ([进度], [状态文本], [说明]),
  rows: (
    ([加载中], [`正在加载: {current}`], [显示当前加载的文件名]),
    ([全部完成], [`加载完成！`], [所有资源加载成功]),
    ([部分失败], [`{errorCount} 个资源加载失败`], [显示失败数量]),
  ),
  caption: [加载状态显示逻辑],
)

== 错误处理机制

当资源加载失败时：

1. 在错误容器中添加错误消息
2. 错误容器自动滚动到底部显示最新错误
3. 继续加载其他资源（不中断）
4. 所有资源处理完成后显示操作按钮
5. 用户可选择重试或跳过加载

```js
// 错误处理示例
updateProgress({ type, count, errorCount, total, current, error }) {
  if (type === 'failed') {
    // 显示错误容器
    this.$error.classList.remove('hidden')
    
    // 添加错误消息
    const p = document.createElement('p')
    p.textContent = error.message
    this.$error.appendChild(p)
    
    // 滚动到底部
    this.$error.scrollTop = this.$error.scrollHeight
  }
  
  // 所有资源处理完成后
  if (count >= total && errorCount > 0) {
    // 显示操作按钮
    this.$action.classList.remove('hidden')
  }
}
```

= 使用场景与示例

== 场景 1：游戏启动流程（main.js）

```js
import Loading from './Loading.js'
import Game2D from './game2d/Game2D.js'
import AchievementManager from './AchievementManager.js'

// 监听加载完成事件
Loading.on('complete', () => {
  // 解锁"点击即送"成就
  AchievementManager.add('dian_ji_ji_song')
  
  // 检查是否有自动存档
  const currentUser = localStorage.getItem('rewind-pearl-username')
  const loadSaveData = localStorage.getItem('rewind-pearl-autosave-' + currentUser)
  
  if (loadSaveData) {
    try {
      const saveData = JSON.parse(loadSaveData)
      Game2D.loadGame(saveData)
    } catch (error) {
      console.error('加载存档失败:', error)
      startNewGame()
    }
  } else {
    startNewGame()
  }
})

// 开始加载
Loading.init()

function startNewGame() {
  Game2D.loadLevel(Levels.Prologue)
  Game2D.start(true)
}
```

== 场景 2：调试模式跳过加载

```js
import Loading from './Loading.js'

Loading.on('complete', () => {
  startGame()
})

// 检查调试模式
const debugMode = localStorage.getItem('rewind-pearl-debug-mode')
if (debugMode) {
  console.log('[DEBUG] 跳过资源加载')
  Loading.init(true)  // 跳过加载
} else {
  Loading.init()  // 正常加载
}
```

== 场景 3：自定义加载界面样式

```css
/* 加载容器 */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.3s;
}

.loading-container.hidden {
  opacity: 0;
  pointer-events: none;
}

/* 进度条 */
.loading-progress {
  width: 60%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.loading-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* 状态文本 */
.loading-status {
  color: white;
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
}

/* 错误容器 */
.loading-error {
  max-width: 60%;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 20px;
}

.loading-error.hidden {
  display: none;
}

.loading-error p {
  color: #ff6b6b;
  font-size: 12px;
  margin: 5px 0;
}

/* 操作按钮 */
.loading-action {
  display: flex;
  gap: 20px;
}

.loading-action.hidden {
  display: none;
}

.loading-action button {
  padding: 10px 30px;
  background: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.loading-action button:hover {
  transform: scale(1.05);
}

#loading-retry {
  background: #4caf50;
  color: white;
}

#loading-skip {
  background: #ff9800;
  color: white;
}
```

== 场景 4：添加加载动画

```html
<div class="loading-container">
  <!-- 旋转 Logo -->
  <div class="loading-logo">
    <img src="../logo.png" alt="Game Logo">
  </div>
  
  <div class="loading-progress">
    <div class="loading-progress-fill"></div>
  </div>
  
  <div class="loading-status">正在加载资源...</div>
  
  <!-- 加载提示文本 -->
  <div class="loading-tips">
    小提示：按 ESC 键可以暂停游戏
  </div>
  
  <div class="loading-error hidden"></div>
  <div class="loading-action hidden">
    <button id="loading-retry">重试</button>
    <button id="loading-skip">跳过加载</button>
  </div>
</div>
```

```css
.loading-logo {
  animation: rotate 2s linear infinite;
  margin-bottom: 40px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-tips {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-top: 20px;
  font-style: italic;
}
```

== 场景 5：多阶段加载

```js
import Loading from './Loading.js'
import Asset from './Asset.js'

async function multiStageLoading() {
  // 第一阶段：加载核心资源
  Loading.$status.textContent = '加载核心资源...'
  await Asset.loadFromManifest('assets/core/', (data) => {
    Loading.updateProgress(data)
  })
  
  // 第二阶段：加载关卡资源
  Loading.$status.textContent = '加载关卡数据...'
  await loadLevelData()
  
  // 第三阶段：初始化游戏系统
  Loading.$status.textContent = '初始化游戏系统...'
  await initGameSystems()
  
  // 完成
  await Loading.hide()
  Loading.emit('complete')
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 不监听 complete 事件就开始游戏
  Loading.init()
  Game2D.start()  // 资源可能还未加载完成
  ```,
  good: ```js
  // 等待加载完成后再开始
  Loading.on('complete', () => {
    Game2D.start()
  })
  Loading.init()
  ```,
  explanation: [必须等待 `complete` 事件后再启动游戏，确保所有资源已加载。],
)

#best-practice(
  bad: ```js
  // 硬编码资源路径
  await Asset.loadFromManifest('./game/assets/')
  ```,
  good: ```js
  // 使用相对路径
  await Asset.loadFromManifest('assets/')
  ```,
  explanation: "使用相对路径保持灵活性，便于项目结构调整和部署。",
)

#best-practice(
  bad: ```js
  // 不处理加载错误
  try {
    await Asset.loadFromManifest('assets/')
  } catch (error) {
    // 忽略错误
  }
  ```,
  good: ```js
  // Loading 自动处理错误
  Loading.init()  // 内部已包含错误处理
  ```,
  explanation: [`Loading.init()` 内部已实现完整的错误处理，包括显示错误信息和操作按钮。],
)

#best-practice(
  bad: ```js
  // 手动操作 DOM 元素
  document.querySelector('.loading-progress-fill').style.width = '50%'
  ```,
  good: ```js
  // 使用 updateProgress 方法
  Loading.updateProgress({
    type: 'completed',
    count: 25,
    total: 50,
    current: 'background/home.png'
  })
  ```,
  explanation: "使用封装的方法更新进度，保持代码一致性和可维护性。",
)

= 注意事项

#info-box(
  title: "HTML 元素依赖",
  type: "warning",
)[
  Loading 依赖特定类名的 HTML 元素（如 `.loading-container`、`.loading-progress-fill` 等）。确保这些元素在页面中存在，否则会导致功能失效。
]

#info-box(
  title: "加载顺序",
  type: "info",
)[
  必须先调用 `Loading.on('complete', callback)` 注册监听器，然后再调用 `Loading.init()` 开始加载。否则可能错过 `complete` 事件。
]

#info-box(
  title: "调试模式",
  type: "info",
)[
  使用 `Loading.init(true)` 可以跳过资源加载，直接触发 `complete` 事件。这在开发调试时很有用，但生产环境应设为 `false`。
]

#info-box(
  title: "错误累积",
  type: "warning",
)[
  加载错误会累积显示在错误容器中。如果资源较多且错误较多，可能导致错误列表过长。建议在错误容器上设置 `max-height` 和 `overflow-y: auto`。
]

#info-box(
  title: "重试机制",
  type: "info",
)[
  点击"重试"按钮会重新调用 `init()`，清空之前的错误信息并重新加载所有资源。跳过按钮会直接调用 `init(true)` 跳过加载。
]

#info-box(
  title: "DOM 移除",
  type: "warning",
)[
  `hide()` 方法会在动画完成后调用 `remove()` 从 DOM 中移除加载容器。这意味着无法再次显示加载界面，除非重新加载页面。
]

= 技术细节

== 类结构

```js
class Loading {
  #listener = new EventListener()  // 事件系统
  
  // 缓存 DOM 元素
  $container = $('.loading-container')
  $progress = $('.loading-progress-fill')
  $status = $('.loading-status')
  $action = $('.loading-action')
  $error = $('.loading-error')
  
  constructor() {
    // 绑定按钮事件
    $('#loading-retry').addEventListener('click', () => this.init())
    $('#loading-skip').addEventListener('click', () => this.init(true))
  }
  
  // 公共方法
  on(event, callback) { /* ... */ }
  async init(skipAssetLoading = false) { /* ... */ }
  async hide() { /* ... */ }
  updateProgress(progressData) { /* ... */ }
}

// 导出全局单例
export default new Loading()
```

== 进度计算

进度百分比计算公式：

```js
const percentage = Math.round((count / total) * 100)
this.$progress.style.width = `${percentage}%`
```

例如：
- `count = 25, total = 100` → `25%`
- `count = 50, total = 100` → `50%`
- `count = 100, total = 100` → `100%`

== 错误信息滚动

错误容器自动滚动到底部，确保最新错误可见：

```js
this.$error.scrollTop = this.$error.scrollHeight
```

== 依赖关系

`Loading.js` 依赖以下模块：

- `utils.js`：DOM 查询（`$`）、事件系统（`EventListener`）、延时工具（`wait`）
- `Asset.js`：资源加载（通过 `init()` 调用）

被以下模块使用：

- `main.js`：监听 `complete` 事件，启动游戏

== 初始化流程

```js
async init(skipAssetLoading = false) {
  try {
    // 1. 显示加载界面
    this.$container.classList.remove('hidden')
    
    // 2. 重置状态
    this.$progress.style.width = '0%'
    this.$status.textContent = ''
    this.$error.innerHTML = ''
    this.$action.classList.add('hidden')
    this.$error.classList.add('hidden')
    
    // 3. 加载资源（可选）
    if (!skipAssetLoading) {
      await Asset.loadFromManifest('assets/', data =>
        this.updateProgress(data)
      )
    }
    
    // 4. 隐藏加载界面
    await this.hide()
    
    // 5. 触发完成事件
    this.#listener.emit('complete')
  } catch (error) {
    // 6. 显示操作按钮
    this.$action.classList.remove('hidden')
  }
}
```

== 动画实现

淡出动画通过 CSS 类控制：

```js
async hide() {
  this.$container.classList.add('hidden')  // 添加 hidden 类
  await wait(300)  // 等待动画完成
  this.$container.remove()  // 从 DOM 移除
}
```

对应的 CSS：

```css
.loading-container {
  transition: opacity 0.3s;
}

.loading-container.hidden {
  opacity: 0;
  pointer-events: none;
}
```

== 事件系统

使用 `EventListener` 实现事件通知：

```js
#listener = new EventListener()

on(event, callback) {
  return this.#listener.on(event, callback)
}

// 触发事件
this.#listener.emit('complete')
```

== 按钮事件绑定

构造函数中绑定操作按钮：

```js
constructor() {
  $('#loading-retry').addEventListener('click', () => this.init())
  $('#loading-skip').addEventListener('click', () => this.init(true))
}
```

- 重试按钮：重新加载所有资源
- 跳过按钮：跳过资源加载，直接完成

== 与 Asset 的协作

```
Loading.init()
    ↓
Asset.loadFromManifest('assets/', onProgress)
    ↓ (每个文件)
onProgress(data) → Loading.updateProgress(data)
    ↓
更新进度条和状态文本
```

Loading 作为 Asset 加载进度的显示层，通过回调函数接收进度数据并更新 UI。
