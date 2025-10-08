// ============================================================================
// Asset.js 模块文档
// rewind-pearl 游戏引擎 - 资源加载与管理系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "Asset.js 文档",
  subtitle: "资源加载与管理系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`Asset.js` 是 rewind-pearl 游戏引擎的资源管理模块，负责游戏所需各类资源（图片、音频、JSON、文本等）的批量加载、缓存和查询。该模块基于 `manifest.json` 配置文件实现声明式资源管理，支持进度跟踪和错误处理，是游戏启动流程的关键组件。

== 核心特性

- *声明式管理*：通过 `manifest.json` 统一声明所有资源，避免硬编码
- *自动类型识别*：根据文件扩展名自动选择加载器（图片、音频、JSON 等）
- *递归加载*：支持嵌套目录结构的资源组织
- *进度跟踪*：提供实时加载进度回调，方便显示加载界面
- *缓存机制*：加载后的资源存储在内存中，通过键名快速访问
- *单例模式*：全局唯一实例，确保资源一致性

== 导入方式

```js
import Asset from './Asset.js'
```

#info-box(
  title: "注意",
  type: "warning",
)[
  `Asset.js` 导出的是一个已实例化的单例对象，可直接使用，无需 `new` 关键字。
]

= 资源组织结构

== manifest.json 格式

资源通过 `manifest.json` 文件进行声明，支持嵌套结构：

```json
{
  "background": {
    "home": "background/home.png",
    "cave": "background/cave.png",
    "raincity0": "background/raincity0.png"
  },
  "character": {
    "dingzhen": {
      "normal": "character/dingzhen/normal.png",
      "happy": "character/dingzhen/happy.png"
    },
    "otto": {
      "normal": "character/otto/normal.png"
    }
  },
  "audio": {
    "Home": "audio/Toby Fox - Home.mp3",
    "Gate of steiner": "audio/阿保剛 - Gate of steiner.mp3"
  },
  "dialogue": {
    "chapter1_start": "dialogue/chapter1_start.json",
    "chapter1_end": "dialogue/chapter1_end.json"
  }
}
```

== 资源键名映射

加载后，资源通过路径式键名访问：

#styled-table(
  columns: (2fr, 3fr),
  headers: ([Manifest 路径], [访问键名]),
  rows: (
    ([`background.home`], [`"background/home"`]),
    ([`character.dingzhen.normal`], [`"character/dingzhen/normal"`]),
    ([`audio.Home`], [`"audio/Home"`]),
    ([`dialogue.chapter1_start`], [`"dialogue/chapter1_start"`]),
  ),
  caption: [资源键名映射规则],
)

#info-box(
  title: "注意",
  type: "info",
)[
  访问键名使用斜杠 `/` 分隔层级，而非点号 `.`。例如 `Asset.get('background/home')` 而非 `Asset.get('background.home')`。
]

= API 参考

== 资源加载

#api(
  name: "loadFromManifest(manifest, onProgress)",
  description: "从 manifest 配置文件或对象加载所有资源。支持递归解析嵌套结构，自动识别资源类型。",
  parameters: (
    (
      name: "manifest",
      type: "Object | string",
      description: [manifest 对象或文件路径。如果传入字符串，会自动拼接 `manifest.json` 并加载],
    ),
    (
      name: "onProgress",
      type: "Function",
      optional: true,
      description: [进度回调函数，接收参数 `{ type, count, errorCount, total, current, error? }`],
    ),
  ),
  returns: (type: "Promise<any[]>", description: "返回 Promise，resolve 时包含所有加载的资源数组"),
  example: ```js
  import Asset from './Asset.js'

  // 从文件加载
  await Asset.loadFromManifest('./assets/', (progress) => {
    if (progress.type === 'completed') {
      console.log(`加载进度: ${progress.count}/${progress.total}`)
      console.log(`当前文件: ${progress.current}`)
    } else if (progress.type === 'failed') {
      console.error(`加载失败: ${progress.current}`, progress.error)
    }
  })

  // 从对象加载
  const manifest = {
    background: { home: 'bg/home.png' },
    audio: { bgm: 'audio/bgm.mp3' }
  }
  await Asset.loadFromManifest(manifest)
  ```,
  notes: [加载失败的资源会抛出异常，但不会中断其他资源的加载。建议在 `onProgress` 中处理错误。],
)

#api(
  name: "load(url, type)",
  description: "加载单个资源文件。如果未指定类型，会根据文件扩展名自动识别。",
  parameters: (
    (name: "url", type: "string", description: [资源的相对路径或 URL，会自动拼接 `basePath`]),
    (
      name: "type",
      type: "string",
      optional: true,
      description: [资源类型：`'image'`, `'audio'`, `'json'`, `'text'`, `'xml'`, `'binary'`],
    ),
  ),
  returns: (type: "Promise<any>", description: "返回 Promise，resolve 时包含加载的资源对象"),
  example: ```js
  // 自动识别类型
  const img = await Asset.load('background/home.png')
  const bgm = await Asset.load('audio/bgm.mp3')
  const data = await Asset.load('config/settings.json')

  // 手动指定类型
  const textData = await Asset.load('data.txt', 'text')
  ```,
  notes: [此方法不会将资源添加到缓存中，仅用于临时加载。推荐使用 `loadFromManifest` 统一管理。],
)

== 资源查询

#api(
  name: "get(key)",
  description: [获取已加载的资源。资源必须先通过 `loadFromManifest` 加载。],
  parameters: (
    (name: "key", type: "string", description: [资源的键名（路径形式，如 `'background/home'`）]),
  ),
  returns: (type: "any", description: [返回对应的资源对象（Image、Audio、Object 等），未找到则返回 `undefined`]),
  example: ```js
  // 获取背景图片
  const bgImage = Asset.get('background/home')
  ctx.drawImage(bgImage, 0, 0)

  // 获取音频
  const bgm = Asset.get('audio/Home')
  bgm.play()

  // 获取对话数据
  const dialogueData = Asset.get('dialogue/chapter1_start')
  console.log(dialogueData.events)

  // 获取角色立绘
  const characterImg = Asset.get('character/dingzhen/normal')
  ```,
  notes: [如果资源不存在，控制台会输出警告信息并返回 `undefined`。使用前建议先用 `has()` 检查。],
)

#api(
  name: "has(key)",
  description: "检查指定资源是否已加载。",
  parameters: (
    (name: "key", type: "string", description: "资源的键名"),
  ),
  returns: (type: "boolean", description: [`true` 表示资源存在，`false` 表示不存在]),
  example: ```js
  if (Asset.has('background/home')) {
    const bg = Asset.get('background/home')
    ctx.drawImage(bg, 0, 0)
  } else {
    console.warn('背景图片未加载')
  }
  ```,
  notes: "推荐在访问资源前先检查是否存在，避免运行时错误。",
)

== 配置属性

#api(
  name: "basePath",
  description: [资源的基础路径，所有相对路径都会基于此路径解析。默认为 `'./'`。],
  parameters: (),
  returns: (type: "string", description: "当前的基础路径"),
  example: ```js
  // 在加载 manifest 前设置
  Asset.basePath = './game/assets/'
  // 从 manifest 路径自动设置
  await Asset.loadFromManifest('./game/assets/')
  console.log(Asset.basePath)  // './game/assets/'
  ```,
  notes: [调用 `loadFromManifest` 传入字符串路径时，会自动设置 `basePath`。],
)

= 支持的资源类型

#styled-table(
  columns: (1fr, 2fr, 2fr),
  headers: ([类型], [文件扩展名], [返回对象]),
  rows: (
    ([图片], [`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`], [`HTMLImageElement`]),
    ([音频], [`.mp3`, `.wav`, `.ogg`, `.aac`], [`HTMLAudioElement`]),
    ([JSON], [`.json`], [`Object`（解析后）]),
    ([文本], [`.txt`, `.md`], [`string`]),
    ([XML], [`.xml`], [`Document`]),
    ([二进制], [其他扩展名], [`ArrayBuffer`]),
  ),
  caption: [支持的资源类型与返回值],
)

#info-box(
  title: "提示：音频克隆",
  type: "info",
)[
  通过 `Asset.get()` 获取的音频对象是原始对象的引用。在 `SoundManager.js` 中，音效播放时会使用 `cloneNode()` 克隆音频对象，以支持同时播放多个实例。
]

= 使用场景与示例

== 场景 1：游戏启动时加载资源

在游戏主模块中加载所有资源，并显示加载进度。

```js
import Asset from './Asset.js'
import Loading from './Loading.js'

async function initGame() {
  Loading.show()

  try {
    await Asset.loadFromManifest('./assets/', (progress) => {
      if (progress.type === 'completed') {
        const percent = Math.round((progress.count / progress.total) * 100)
        Loading.updateProgress(percent, progress.current)
      } else if (progress.type === 'failed') {
        console.error(`资源加载失败: ${progress.current}`, progress.error)
      }
    })

    Loading.hide()
    startGame()
  } catch (error) {
    console.error('资源加载出错:', error)
    Loading.showError('资源加载失败，请刷新页面')
  }
}
```

== 场景 2：游戏中使用资源

在游戏逻辑中获取并使用已加载的资源。

```js
import Asset from './Asset.js'

class Game2D {
  render() {
    const ctx = this.ctx

    // 绘制背景
    const bg = Asset.get('background/raincity0')
    ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height)

    // 绘制角色
    const characterImg = Asset.get('character/dingzhen/normal')
    ctx.drawImage(characterImg, this.player.x, this.player.y)
  }

  playBGM() {
    const bgm = Asset.get('audio/Home')
    bgm.loop = true
    bgm.volume = 0.5
    bgm.play()
  }
}
```

== 场景 3：加载对话数据

`Dialogue.js` 从 Asset 获取对话脚本数据。

```js
import Asset from './Asset.js'

class Dialogue {
  load(scriptName) {
    const script = Asset.get(`dialogue/${scriptName}`)

    if (!script) {
      console.error(`对话脚本不存在: ${scriptName}`)
      return false
    }

    this.events = script.events
    this.characters = script.characters
    return true
  }

  async play(scriptName) {
    if (this.load(scriptName)) {
      await this.processEvents()
    }
  }
}
```

== 场景 4：检查资源是否存在

在使用资源前先检查其是否已加载。

```js
import Asset from './Asset.js'

function drawCharacter(characterName, pose) {
  const key = `character/${characterName}/${pose}`

  if (!Asset.has(key)) {
    console.warn(`角色立绘不存在: ${key}`)
    return Asset.get('character/default/normal')
  }

  return Asset.get(key)
}
```

== 场景 5：动态加载额外资源

在特定场景下加载额外的资源（非 manifest 中的）。

```js
import Asset from './Asset.js'

async function loadSpecialEffect() {
  try {
    const effect = await Asset.load('effects/special.png')
    // 临时使用，不缓存
    ctx.drawImage(effect, x, y)
  } catch (error) {
    console.error('特效加载失败:', error)
  }
}
```

= 最佳实践

#best-practice(
  bad: ```js
  const img = new Image()
  img.src = './assets/background/home.png'
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
  }




  ```,
  good: ```js
  // 在 manifest.json 中声明
  // 启动时统一加载
  await Asset.loadFromManifest('./assets/')

  // 使用时直接获取
  const img = Asset.get('background/home')
  ctx.drawImage(img, 0, 0)
  ```,
  explanation: "使用 Asset 统一管理资源，避免分散的手动加载代码，便于维护和性能优化。",
)

#best-practice(
  bad: ```js
  const bg = Asset.get('background/nonexist')
  ctx.drawImage(bg, 0, 0)  // 可能报错





  ```,
  good: ```js
  if (Asset.has('background/home')) {
    const bg = Asset.get('background/home')
    ctx.drawImage(bg, 0, 0)
  } else {
    console.warn('背景资源未加载')
  }
  ```,
  explanation: [使用 `has()` 检查资源是否存在，避免运行时错误。],
)

#best-practice(
  bad: ```js
  // 在 manifest 中使用绝对路径
  {
    "background": {
      "home": "/assets/background/home.png"
    }
  }



  ```,
  good: ```js
  // 使用相对路径，配合 basePath
  {
    "background": {
      "home": "background/home.png"
    }
  }

  // 在代码中设置 basePath
  Asset.loadFromManifest('./assets/')
  ```,
  explanation: "使用相对路径保持灵活性，便于项目部署和路径调整。",
)

#best-practice(
  bad: ```js
  // 多次加载同一资源
  await Asset.load('background/home.png')
  await Asset.load('background/home.png')





  ```,
  good: ```js
  // 通过 manifest 统一加载，自动去重
  await Asset.loadFromManifest('./assets/')

  // 多次获取不会重复加载
  const bg1 = Asset.get('background/home')
  const bg2 = Asset.get('background/home')  // 返回同一对象
  ```,
  explanation: [`loadFromManifest` 会自动检查资源是否已加载，避免重复加载浪费资源。],
)

= 注意事项

#info-box(
  title: "错误处理",
  type: "error",
)[
  - 加载失败的资源会在 `onProgress` 回调中触发 `type: 'failed'` 事件
  - 同时会抛出异常，但不会中断其他资源的加载
  - 建议在 `onProgress` 中收集失败的资源，在加载完成后统一处理
]

#info-box(
  title: "资源路径约定",
  type: "warning",
)[
  - manifest 中的路径使用相对于 `basePath` 的相对路径
  - 访问键名使用斜杠 `/` 分隔层级（如 `'background/home'`）
  - 不要在 manifest 路径中包含 `basePath`，会导致路径重复
]

#info-box(
  title: "加载顺序",
  type: "warning",
)[
  `loadFromManifest` 并行加载所有资源，加载完成的顺序不确定。如果需要按特定顺序执行操作，应在所有资源加载完成后（Promise resolve）再进行。
]

#info-box(
  title: "内存管理",
  type: "info",
)[
  所有加载的资源都存储在内存中（Map 结构），直到页面刷新或手动清除。对于大型游戏，考虑实现资源卸载功能或分场景加载。
]

= 技术细节

== 资源类型识别

模块通过文件扩展名自动识别资源类型：

```js
#getAssetTypeFromExtension(extension) {
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac']
  const textExtensions = ['txt', 'md']

  if (imageExtensions.includes(extension)) return 'image'
  else if (audioExtensions.includes(extension)) return 'audio'
  else if (extension === 'json') return 'json'
  else if (textExtensions.includes(extension)) return 'text'
  else if (extension === 'xml') return 'xml'
  return 'binary'
}
```

== 加载器实现

每种资源类型都有对应的私有加载方法：

- `#loadImage(url)`：返回 `Promise<HTMLImageElement>`
- `#loadAudio(url)`：返回 `Promise<HTMLAudioElement>`
- `#loadJSON(url)`：使用 `fetch` + `response.json()`
- `#loadText(url)`：使用 `fetch` + `response.text()`
- `#loadXML(url)`：使用 `DOMParser` 解析
- `#loadBinary(url)`：使用 `fetch` + `response.arrayBuffer()`

== 进度跟踪

`onProgress` 回调接收的参数对象结构：

```js
{
  type: 'completed' | 'failed' | 'progress',
  count: number,        // 已处理的资源数
  errorCount: number,   // 失败的资源数
  total: number,        // 总资源数
  current: string,      // 当前资源键名
  error?: Error         // 错误对象（仅 type === 'failed' 时）
}
```

== 依赖关系

`Asset.js` 不依赖项目中的其他模块，但被以下模块使用：

- `main.js`：游戏启动时加载资源
- `Loading.js`：显示资源加载进度
- `SoundManager.js`：获取音频资源
- `Dialogue.js`：获取对话脚本数据
- `Game2D.js`：获取游戏素材（背景、角色等）

== 实现特点

- *单例模式*：导出已实例化的对象，全局共享资源缓存
- *私有字段*：使用 `#assets`、`#loadImage` 等私有成员封装内部状态
- *递归解析*：使用递归函数 `loadRecursively` 处理嵌套的 manifest 结构
- *并行加载*：使用 `Promise.all` 并行加载所有资源，提升效率
