// ============================================================================
// SoundManager.js 模块文档
// rewind-pearl 游戏引擎 - 音频管理系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "SoundManager.js 文档",
  subtitle: "音频管理系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`SoundManager.js` 是 rewind-pearl 游戏引擎的音频管理模块，负责背景音乐（BGM）和音效（Sound Effects）的播放、暂停、停止、音量控制及淡入淡出效果。该模块与 `Asset.js` 配合使用，提供了完整的游戏音频解决方案，并能够优雅处理浏览器自动播放策略限制。

== 核心特性

- *BGM 管理*：支持循环播放、淡入淡出、暂停恢复
- *音效播放*：支持同时播放多个音效实例，可控制单次播放模式
- *自动播放策略*：智能处理浏览器自动播放限制，等待用户交互后自动播放
- *音量控制*：独立控制 BGM 和音效音量
- *淡入淡出*：平滑的音量过渡效果，避免突兀的音频切换
- *资源管理*：自动管理音效实例生命周期，避免内存泄漏
- *单例模式*：全局唯一实例，统一音频状态管理

== 导入方式

```js
import SoundManager from './SoundManager.js'
```

#info-box(
  type: "warning",
)[
  `SoundManager.js` 导出的是一个已实例化的单例对象，可直接使用，无需 `new` 关键字。
]

= API 参考

== BGM 管理

#api(
  name: "playBGM(name, options)",
  description: "播放背景音乐。如果当前正在播放相同的 BGM，则不会重复播放。支持循环、音量控制和淡入效果。",
  parameters: (
    (name: "name", type: "string", description: [BGM 资源名称（Asset 中的键名，不含路径前缀 `audio/`）]),
    (name: "options", type: "Object", optional: true, description: "播放选项"),
    (name: "options.loop", type: "boolean", optional: true, description: [是否循环播放（默认 `true`）]),
    (name: "options.volume", type: "number", optional: true, description: [音量大小，范围 0-1（默认 `0.4`）]),
    (name: "options.fadeIn", type: "boolean", optional: true, description: [是否淡入（默认 `true`）]),
    (name: "options.fadeTime", type: "number", optional: true, description: [淡入时长，单位毫秒（默认 `2000`）]),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import SoundManager from './SoundManager.js'
  
  // 基础用法
  SoundManager.playBGM('Home')
  
  // 自定义选项
  SoundManager.playBGM('Gate of steiner', {
    loop: true,
    volume: 0.6,
    fadeIn: true,
    fadeTime: 3000
  })
  
  // 无淡入效果
  SoundManager.playBGM('Memories of Memories', {
    fadeIn: false,
    volume: 0.5
  })
  ```,
  notes: "如果浏览器阻止自动播放，模块会等待用户交互（点击或按键）后自动播放。控制台会输出警告信息。",
)

#api(
  name: "pauseBGM()",
  description: [暂停当前播放的 BGM，保留播放位置。可通过 `resumeBGM()` 恢复播放。],
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 游戏暂停时
  SoundManager.pauseBGM()
  
  // 进入设置界面时
  function openSettings() {
    SoundManager.pauseBGM()
    showSettingsMenu()
  }
  ```,
  notes: "如果当前没有播放 BGM，调用此方法无任何效果。",
)

#api(
  name: "resumeBGM()",
  description: "恢复暂停的 BGM 播放，从暂停位置继续。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 游戏恢复时
  SoundManager.resumeBGM()
  
  // 关闭设置界面时
  function closeSettings() {
    hideSettingsMenu()
    SoundManager.resumeBGM()
  }
  ```,
  notes: "如果恢复时遇到自动播放限制，会等待用户交互后自动恢复。",
)

#api(
  name: "stopBGM(options)",
  description: "停止当前播放的 BGM，重置播放位置。支持淡出效果。",
  parameters: (
    (name: "options", type: "Object", optional: true, description: "停止选项"),
    (name: "options.fadeOut", type: "boolean", optional: true, description: [是否淡出（默认 `true`）]),
    (name: "options.fadeTime", type: "number", optional: true, description: [淡出时长，单位毫秒（默认 `2000`）]),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 淡出停止（推荐）
  SoundManager.stopBGM()
  
  // 自定义淡出时长
  SoundManager.stopBGM({ fadeOut: true, fadeTime: 1000 })
  
  // 立即停止（无淡出）
  SoundManager.stopBGM({ fadeOut: false })
  ```,
  notes: [调用 `stopBGM` 会清除等待播放的 BGM 队列，并移除用户交互监听器。],
)

== 音效管理

#api(
  name: "play(name, options)",
  description: "播放音效。支持同时播放多个实例（如多个枪声），或限制为单实例播放（如角色语音）。",
  parameters: (
    (name: "name", type: "string", description: [音效资源名称（Asset 中的键名，不含路径前缀 `soundEffects/`）]),
    (name: "options", type: "Object", optional: true, description: "播放选项"),
    (name: "options.single", type: "boolean", optional: true, description: [是否为单实例播放（默认 `true`）。`true` 时，如果已有实例在播放则跳过]),
    (name: "options.volume", type: "number", optional: true, description: [音量大小，范围 0-1（默认 `0.5`）]),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  import SoundManager from './SoundManager.js'
  
  // 单实例播放（默认）
  SoundManager.play('footstep')  // 连续调用只会播放一次
  
  // 多实例播放
  SoundManager.play('gunshot', { single: false })  // 可同时播放多次
  
  // 自定义音量
  SoundManager.play('explosion', {
    single: false,
    volume: 0.8
  })
  
  // 暂停音效播放
  SoundManager.play('pause', { volume: 0.3 })
  ```,
  notes: "音效实例在播放结束后会自动从管理器中移除，无需手动清理。",
)

#api(
  name: "stopSound()",
  description: "停止所有正在播放的音效，并清空音效管理队列。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 场景切换时停止所有音效
  function changeScene() {
    SoundManager.stopSound()
    loadNewScene()
  }
  
  // 游戏结束时
  function gameOver() {
    SoundManager.stopSound()
    SoundManager.stopBGM({ fadeOut: true, fadeTime: 1500 })
  }
  ```,
  notes: "此方法不会影响 BGM 播放，只停止音效。",
)

= 内部机制

== 自动播放策略处理

现代浏览器为了用户体验，限制了自动播放音频（需要用户交互）。`SoundManager` 实现了智能处理机制：

```js
// 内部实现逻辑（简化版）
playBGM(name, options) {
  bgm.play().catch(() => {
    console.warn(`Failed to play bgm: ${name}, will wait for user interaction.`)
    this.pendingBGM = { name, options }
    this.#waitForUserInteraction()
  })
}

#waitForUserInteraction() {
  const handler = () => {
    if (this.pendingBGM) {
      const { name, options } = this.pendingBGM
      this.playBGM(name, options)
    }
  }
  addEventListener('click', handler, { once: true })
  addEventListener('keydown', handler, { once: true })
}
```

#info-box(
  type: "info",
)[
  推荐在用户点击"开始游戏"按钮后再播放 BGM，避免自动播放被阻止。在加载界面可以不播放音乐，进入游戏主界面后再启动。
]

== 音量淡入淡出

淡入淡出通过 `requestAnimationFrame` 实现平滑的音量过渡：

```js
#fadeAudio(audio, startVolume, endVolume, duration, callback) {
  const startTime = performance.now()
  const volumeDiff = endVolume - startVolume
  
  const updateVolume = () => {
    const elapsed = performance.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    audio.volume = startVolume + volumeDiff * progress
    
    if (progress < 1) {
      requestAnimationFrame(updateVolume)
    } else if (callback) {
      callback()
    }
  }
  
  requestAnimationFrame(updateVolume)
}
```

== 音效实例管理

音效使用 `cloneNode()` 克隆原始音频对象，支持同时播放多个实例：

```js
play(name, { single = true, volume = 0.5 } = {}) {
  // 检查是否已有实例在播放
  if (single) {
    const instances = this.sounds.get(name) || []
    if (instances.some(audio => !audio.paused && !audio.ended)) {
      return
    }
  }
  
  const sound = Asset.get('soundEffects/' + name)
  const audio = sound.cloneNode()  // 克隆以支持多实例
  audio.play()
  
  // 播放结束后自动清理
  audio.addEventListener('ended', () => {
    const arr = this.sounds.get(name)
    if (arr) {
      const idx = arr.indexOf(audio)
      if (idx !== -1) arr.splice(idx, 1)
    }
  })
}
```

= 使用场景与示例

== 场景 1：游戏启动时播放 BGM

```js
import SoundManager from './SoundManager.js'

class Game {
  async start() {
    // 等待资源加载完成
    await Asset.loadFromManifest('./assets/')
    
    // 播放主题曲
    SoundManager.playBGM('Home', {
      loop: true,
      volume: 0.4,
      fadeIn: true,
      fadeTime: 2000
    })
    
    this.startGameLoop()
  }
}
```

== 场景 2：场景切换时更换 BGM

```js
class Game {
  changeScene(sceneName) {
    // 停止当前 BGM（淡出）
    SoundManager.stopBGM({ fadeOut: true, fadeTime: 1500 })
    
    // 稍微延迟后播放新 BGM
    setTimeout(() => {
      const bgmName = this.getBGMForScene(sceneName)
      SoundManager.playBGM(bgmName, {
        fadeIn: true,
        fadeTime: 2000
      })
    }, 1500)
  }
  
  getBGMForScene(sceneName) {
    const bgmMap = {
      home: 'Home',
      battle: 'Gate of steiner',
      ending: 'To Far Shores'
    }
    return bgmMap[sceneName] || 'Home'
  }
}
```

== 场景 3：暂停菜单中暂停/恢复 BGM

```js
import SoundManager from './SoundManager.js'
import PauseManager from './PauseManager.js'

class PauseManager {
  pause() {
    // 暂停游戏音乐
    SoundManager.pauseBGM()
    
    // 播放暂停音效
    SoundManager.play('pause', { volume: 0.3 })
    
    this.isPaused = true
    this.$pauseOverlay.classList.add('show')
  }
  
  resume() {
    this.isPaused = false
    this.$pauseOverlay.classList.remove('show')
    
    // 恢复游戏音乐
    SoundManager.resumeBGM()
  }
}
```

== 场景 4：游戏中播放音效

```js
import SoundManager from './SoundManager.js'

class Player {
  jump() {
    if (this.onGround) {
      this.velocityY = -10
      this.onGround = false
      
      // 播放跳跃音效
      SoundManager.play('jump', { volume: 0.5 })
    }
  }
  
  onDamage() {
    this.health -= 10
    
    // 播放受伤音效
    SoundManager.play('hurt', { volume: 0.6 })
    
    if (this.health <= 0) {
      this.die()
    }
  }
  
  collectItem() {
    this.score += 100
    
    // 播放收集音效（可多实例）
    SoundManager.play('collect', {
      single: false,
      volume: 0.7
    })
  }
}
```

== 场景 5：成就解锁时播放音效

```js
import SoundManager from './SoundManager.js'

class Achievement {
  add(id) {
    const user = this.#username
    if (!user) return false
    
    const allData = this.#getAllData()
    if (!allData[user]) allData[user] = {}
    
    if (!allData[user][id]) {
      this.game.showNotification(`成就已解锁：${id}`, {
        icon: '🏆',
        type: 'success',
      })
      
      // 播放成就解锁音效
      SoundManager.play('challenge_complete')
      
      allData[user][id] = true
      this.#save(allData)
    }
    
    return true
  }
}
```

= 最佳实践

#best-practice(
  bad: ```js
  const bgm = Asset.get('audio/Home')
  bgm.play()
  bgm.volume = 0.4
  ```,
  good: ```js
  SoundManager.playBGM('Home', {
    volume: 0.4,
    fadeIn: true
  })
  ```,
  explanation: "使用 SoundManager 统一管理音频，自动处理淡入淡出、自动播放限制等问题。",
)

#best-practice(
  bad: ```js
  // 切换 BGM 时直接切换
  SoundManager.stopBGM({ fadeOut: false })
  SoundManager.playBGM('newBGM', { fadeIn: false })
  ```,
  good: ```js
  // 使用淡入淡出平滑过渡
  SoundManager.stopBGM({ fadeOut: true, fadeTime: 1500 })
  setTimeout(() => {
    SoundManager.playBGM('newBGM', {
      fadeIn: true,
      fadeTime: 2000
    })
  }, 1500)
  ```,
  explanation: "使用淡入淡出效果避免音频切换时的突兀感，提升用户体验。",
)

#best-practice(
  bad: ```js
  // 连续播放音效时不限制
  for (let i = 0; i < 10; i++) {
    SoundManager.play('explosion', { single: false })
  }
  ```,
  good: ```js
  // 根据音效类型选择单实例或多实例
  // 单实例：角色语音、UI 音效
  SoundManager.play('button_click')
  
  // 多实例：枪声、爆炸声
  SoundManager.play('gunshot', { single: false })
  ```,
  explanation: "根据音效类型合理选择播放模式，避免音频堆叠造成的混乱。",
)

#best-practice(
  bad: ```js
  // 在页面加载时立即播放
  window.onload = () => {
    SoundManager.playBGM('Home')
  }
  ```,
  good: ```js
  // 在用户交互后播放
  startButton.addEventListener('click', () => {
    SoundManager.playBGM('Home')
    startGame()
  })
  ```,
  explanation: "在用户交互后播放音频，避免被浏览器自动播放策略阻止。",
)

= 技术细节

#info-box(
  type: "warning",
)[
  - *浏览器自动播放策略*：现代浏览器默认禁止自动播放音频，需要用户交互（点击、按键等）。`SoundManager` 会自动处理此限制，但首次播放建议在用户交互后触发。如果被阻止，控制台会输出警告信息，并在用户交互后自动播放。
  - *音量范围*：音量参数范围为 0-1，超出范围可能导致播放失败或音量异常。推荐值：BGM 0.3-0.5、音效 0.4-0.7、暂停音效 0.2-0.4。
]

#info-box(
  type: "info",
)[
  - *音频资源命名*：BGM 使用 `playBGM(name)` 时，自动拼接 `audio/` 前缀；音效使用 `play(name)` 时，自动拼接 `soundEffects/` 前缀。在 Asset 的 manifest.json 中对应组织资源结构。
  - *内存管理*：音效实例在播放结束后会自动清理，无需手动管理；BGM 只保留一个实例，切换时会自动释放旧实例；调用 `stopSound()` 会立即清空所有音效实例。
  - *淡入淡出性能*：淡入淡出基于 `requestAnimationFrame` 实现，性能消耗极低。但同时进行多个淡入淡出操作时，建议控制在 2-3 个以内。
]

== 内部状态

```js
class SoundManager {
  sounds = new Map()          // 音效实例管理
  BGM = null                  // 当前 BGM 实例
  currentBGMName = null       // 当前 BGM 名称
  pendingBGM = null           // 等待播放的 BGM
  #userInteractionHandler = null  // 用户交互监听器
}
```

== 依赖关系

`SoundManager.js` 依赖以下模块：

- `Asset.js`：获取音频资源

被以下模块使用：

- `PauseManager.js`：暂停/恢复 BGM，播放暂停音效
- `AchievementManager.js`：播放成就解锁音效
- `Game2D.js`：播放游戏 BGM 和音效
- `Player.js`：播放角色动作音效

== 实现特点

- *单例模式*：导出已实例化的对象，全局共享音频状态
- *智能队列*：自动处理浏览器自动播放限制，等待用户交互后播放
- *资源克隆*：音效使用 `cloneNode()` 支持多实例播放
- *自动清理*：音效播放结束后自动从管理器中移除
- *平滑过渡*：使用 `requestAnimationFrame` 实现精确的音量淡入淡出

== 浏览器兼容性

- 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）
- `HTMLAudioElement.play()` 返回 Promise（ES6+）
- 使用 `addEventListener` 的 `{ once: true }` 选项（现代浏览器）
- 依赖 `requestAnimationFrame`（所有现代浏览器支持）
