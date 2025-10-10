// ============================================================================
// Loading.js 模块文档
// rewind-pearl 游戏引擎 - 加载页面管理器
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "Loading.js",
  subtitle: "加载页面管理器",
  authors: ("windlandneko",),
)

= 模块介绍

`Loading.js` 是 rewind-pearl 游戏引擎的加载页面管理模块，负责在游戏启动时显示加载进度、处理资源加载错误、提供重试和跳过功能。它与 `Asset.js` 模块紧密协作，实时反馈资源加载状态。

== 核心特性

- *进度显示*：实时更新进度条和加载状态文本
- *错误处理*：显示加载失败的资源列表
- *交互控制*：提供重试和跳过按钮
- *事件系统*：支持监听加载完成事件
- *淡出动画*：加载完成后平滑隐藏

== 导入方式

```js
import Loading from './Loading.js'

// Loading 是单例，已自动实例化
Loading.on('complete', () => {
  console.log('资源加载完成！')
})

await Loading.init()
```

= API 参考

== 初始化

#api(
  name: "init(skipAssetLoading)",
  description: "初始化并开始加载资源。",
  parameters: (
    (name: "skipAssetLoading", type: "boolean", optional: true, description: "是否跳过资源加载，默认 false"),
  ),
  returns: (type: "Promise<void>", description: "加载完成时 resolve"),
  example: ```js
  // 正常加载
  await Loading.init()

  // 跳过加载（调试用）
  await Loading.init(true)
  ```,
  notes: [
    - 显示加载容器
    - 调用 `Asset.loadFromManifest()` 加载资源
    - 加载完成后触发 `complete` 事件
    - 如果加载失败，显示重试和跳过按钮
  ],
)

#api(
  name: "hide()",
  description: "隐藏加载界面（带淡出动画）。",
  parameters: (),
  returns: (type: "Promise<void>", description: "动画完成后 resolve（300ms）"),
  notes: "自动移除加载容器的 DOM 元素。",
)

== 事件监听

#api(
  name: "on(event, callback)",
  description: "监听加载事件。",
  parameters: (
    (name: "event", type: "string", description: [事件名称，目前仅支持 `'complete'`]),
    (name: "callback", type: "Function", description: "事件回调函数"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  Loading.on('complete', () => {
    console.log('资源加载完成！')
    // 初始化游戏...
  })
  ```,
)

== 进度更新

#api(
  name: "updateProgress(data)",
  description: "更新加载进度显示（内部方法，由 Asset 模块调用）。",
  parameters: (
    (
      name: "data",
      type: "Object",
      description: [进度数据对象，包含：
        - `type`：事件类型（`'completed'` / `'failed'`）
        - `count`：已加载文件数
        - `errorCount`：加载失败文件数
        - `total`：总文件数
        - `current`：当前正在加载的文件
        - `error`：错误对象（如果有）
      ],
    ),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 由 Asset.loadFromManifest() 自动调用
  await Asset.loadFromManifest('assets/', data => {
    Loading.updateProgress(data)
  })
  ```,
  notes: "自动更新进度条百分比、状态文本和错误列表。",
)

= DOM 结构

Loading 模块操作以下 DOM 元素（需在 HTML 中预先定义）：

```html
<div class="loading-container">
  <div class="loading-progress">
    <div class="loading-progress-fill"></div>
  </div>
  <div class="loading-status"></div>
  <div class="loading-error hidden"></div>
  <div class="loading-action hidden">
    <button id="loading-retry">重试</button>
    <button id="loading-skip">跳过</button>
  </div>
</div>
```

#styled-table(
  columns: (2fr, 3fr),
  headers: ([元素], [功能]),
  rows: (
    ([`.loading-container`], [加载界面容器]),
    ([`.loading-progress-fill`], [进度条填充（通过 `width` 控制）]),
    ([`.loading-status`], [状态文本（"正在加载：xxx"）]),
    ([`.loading-error`], [错误列表容器]),
    ([`.loading-action`], [操作按钮容器（重试/跳过）]),
  ),
  caption: [DOM 元素说明],
)

= 加载流程

```
用户访问游戏
    ↓
main.js 调用 Loading.init()
    ↓
显示加载界面
    ↓
Asset.loadFromManifest() 加载资源
    ├─ 每个文件加载完成 → updateProgress()
    ├─ 更新进度条
    └─ 显示当前文件名
    ↓
所有资源加载完成
    ├─ 成功 → 触发 'complete' 事件 → hide()
    └─ 失败 → 显示错误列表 + 重试/跳过按钮
```

= 错误处理

== 加载失败处理

当资源加载失败时：

1. 错误信息添加到 `.loading-error` 容器
2. 显示重试和跳过按钮
3. 用户点击「重试」→ 重新调用 `init()`
4. 用户点击「跳过」→ 调用 `init(true)` 跳过资源加载

== 错误信息格式

```html
<div class="loading-error">
  <p>Failed to load: assets/audio/bgm.mp3</p>
  <p>Failed to load: assets/image/player.png</p>
</div>
```

错误会累积显示，容器自动滚动到最新错误。

= 与 Asset 模块的协作

Loading 和 Asset 通过回调函数传递进度信息：

```js
// Loading.js
await Asset.loadFromManifest('assets/', data => {
  this.updateProgress(data)
})

// Asset.js
async loadFromManifest(basePath, onProgress) {
  // 加载成功
  onProgress({
    type: 'completed',
    count: loadedCount,
    errorCount: errorCount,
    total: totalFiles,
    current: filename,
  })

  // 加载失败
  onProgress({
    type: 'failed',
    count: loadedCount,
    errorCount: errorCount,
    total: totalFiles,
    current: filename,
    error: new Error(`Failed to load: ${filepath}`),
  })
}
```
