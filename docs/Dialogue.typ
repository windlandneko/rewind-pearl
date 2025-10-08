// ============================================================================
// Dialogue.js 模块文档
// rewind-pearl 游戏引擎 - 对话系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "Dialogue.js 文档",
  subtitle: "对话系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`Dialogue.js` 是 rewind-pearl 游戏引擎的对话系统模块，负责游戏剧情对话的播放、角色立绘管理、背景切换、文本动画、键盘交互等功能。该模块基于 JSON 格式的对话脚本，支持现代风格和东方风格两种对话界面，与资源管理、音频系统、键盘输入等模块深度集成。

== 核心特性

- *对话脚本*：基于 JSON 配置的声明式对话编写
- *多种风格*：支持现代风格和东方风格（气泡）对话界面
- *角色管理*：动态添加、移除、高亮角色立绘
- *文本动画*：逐字显示文本，支持富文本样式标记
- *背景切换*：支持对话过程中切换背景图片
- *音频控制*：支持 BGM 切换和音效播放
- *键盘交互*：支持 Enter/Space 推进、Ctrl 快进、ESC 暂停
- *自动播放*：可配置自动推进延时
- *单例模式*：全局唯一实例，统一对话状态管理

== 导入方式

```js
import Dialogue from './Dialogue.js'
```

#info-box(
  title: "注意",
  type: "warning",
)[
  `Dialogue.js` 导出的是一个已实例化的单例对象（类名为 `Dialogue`），可直接使用，无需 `new` 关键字。
]

= 对话脚本格式

对话脚本使用 JSON 格式，存储在 `game/assets/dialogue/` 目录下。

== 基本结构

```json
{
  "text_style": "modern",
  "auto_next_delay": 0,
  "events": [
    { "action": "background", "id": "home" },
    { "action": "bgm", "id": "Home" },
    {
      "action": "add",
      "id": "dingzhen",
      "key": "dingzhen",
      "position": "left",
      "emotion": "normal",
      "title": "丁真",
      "subtitle": "理塘少年",
      "title_color": "#4a90e2"
    },
    {
      "action": "dialogue",
      "id": "dingzhen",
      "emotion": "happy",
      "text": "你好！欢迎来到理塘。"
    },
    "这是简写形式的对话",
    { "action": "remove", "id": "dingzhen" }
  ]
}
```

== 配置项说明

#styled-table(
  columns: (1fr, 1fr, 3fr),
  headers: ([字段], [类型], [说明]),
  rows: (
    ([`text_style`], [`string`], [对话风格：`'modern'`（现代）或 `'touhou'`（东方）]),
    ([`auto_next_delay`], [`number`], [自动推进延时（毫秒），0 表示禁用自动推进]),
    ([`events`], [`Array`], [事件数组，按顺序执行]),
  ),
  caption: [对话脚本配置项],
)

== 事件类型

#styled-table(
  columns: (1fr, 3fr),
  headers: ([事件类型], [说明]),
  rows: (
    ([`add`], [添加角色到场景]),
    ([`dialogue`], [显示对话文本]),
    ([`remove`], [移除角色]),
    ([`background`], [切换背景图片]),
    ([`bgm`], [切换背景音乐]),
    ([`sound`], [播放音效]),
  ),
  caption: [支持的事件类型],
)

= API 参考

#api(
  name: "play(dialogue)",
  description: "播放指定的对话脚本。加载对话数据，显示对话界面，开始事件处理流程。",
  parameters: (
    (name: "dialogue", type: "string", description: [对话脚本名称（Asset 中的键名，不含路径前缀 `dialogue/`）]),
  ),
  returns: (type: "Promise<void>", description: "返回 Promise，对话结束后 resolve"),
  example: ```js
  import Dialogue from './Dialogue.js'
  
  // 播放开场对话
  await Dialogue.play('chapter1_start')
  console.log('对话结束')
  
  // 在游戏流程中使用
  async function playChapter1() {
    await Dialogue.play('chapter1_intro')
    startGameplay()
    await Dialogue.play('chapter1_end')
    unlockChapter2()
  }
  ```,
  notes: "如果对话已在播放，会输出警告并返回立即 resolve 的 Promise。对话脚本必须在 manifest 中声明并加载。",
)

#api(
  name: "stop(force)",
  description: "停止当前播放的对话，隐藏对话界面，清理角色和状态。",
  parameters: (
    (name: "force", type: "boolean", optional: true, description: [是否强制停止（默认 `false`）。`true` 时不触发 Promise resolve]),
  ),
  returns: (type: "void", description: "无返回值"),
  example: ```js
  import Dialogue from './Dialogue.js'
  
  // 正常停止（触发 Promise resolve）
  Dialogue.stop()
  
  // 强制停止（不触发 Promise，用于中途切换对话）
  Dialogue.stop(true)
  await Dialogue.play('new_dialogue')
  
  // 在紧急情况下停止对话
  emergencyButton.addEventListener('click', () => {
    Dialogue.stop(true)
  })
  ```,
  notes: "停止后会清除所有角色、键盘监听器、定时器等状态。非强制停止时会在 500ms 后触发 Promise resolve。",
)

#api(
  name: "next(skip)",
  description: "推进到下一个对话事件。由键盘输入或自动播放触发。",
  parameters: (
    (name: "skip", type: "boolean", optional: true, description: [是否跳过文本动画（默认 `false`）]),
  ),
  returns: (type: "void", description: "无返回值"),
  example: ```js
  // 通常由键盘事件自动调用
  keyboard.onKeydown('Enter', () => {
    Dialogue.next()
  })
  
  // 快进模式
  keyboard.onKeydown('LCtrl', () => {
    Dialogue.next(true)  // 跳过文本动画
  })
  ```,
  notes: "如果文本正在显示，第一次调用会跳过动画直接显示完整文本，第二次调用才会推进到下一事件。",
)

== 状态属性

#api(
  name: "isPlaying",
  description: "当前是否正在播放对话。",
  parameters: (),
  returns: (type: "boolean", description: [`true` 表示正在播放，`false` 表示未播放]),
  example: ```js
  if (Dialogue.isPlaying) {
    console.log('对话进行中')
  } else {
    console.log('没有对话')
  }
  ```,
)

#api(
  name: "isWaiting",
  description: [当前是否处于等待状态（事件中设置了 `wait` 参数）。],
  parameters: (),
  returns: (type: "boolean", description: [`true` 表示等待中，`false` 表示可推进]),
  example: ```js
  // 等待期间按键无效
  keyboard.onKeydown('Enter', () => {
    if (!Dialogue.isWaiting) {
      Dialogue.next()
    }
  })
  ```,
)

= 事件详解

== add 事件（添加角色）

```json
{
  "action": "add",
  "id": "dingzhen",
  "key": "dingzhen",
  "position": "left",
  "emotion": "normal",
  "title": "丁真",
  "subtitle": "理塘少年",
  "title_color": "#4a90e2"
}
```

#styled-table(
  columns: (1fr, 1fr, 3fr),
  headers: ([字段], [类型], [说明]),
  rows: (
    ([`id`], [`string`], [角色唯一标识符，用于后续引用]),
    ([`key`], [`string`], [角色资源目录名（`character/{key}/{emotion}.png`）]),
    ([`position`], [`string`], [位置：`'left'`（左）或 `'right'`（右）]),
    ([`emotion`], [`string`], [表情/状态名称（对应图片文件名）]),
    ([`title`], [`string`], [角色名称（显示在对话框顶部）]),
    ([`subtitle`], [`string`], [副标题/角色描述（可选）]),
    ([`title_color`], [`string`], [标题颜色（CSS 颜色值，可选）]),
  ),
  caption: [add 事件字段说明],
)

== dialogue 事件（显示对话）

```json
{
  "action": "dialogue",
  "id": "dingzhen",
  "emotion": "happy",
  "text": "你好！欢迎来到$highlight:理塘$。",
  "wait": 2000
}
```

#styled-table(
  columns: (1fr, 1fr, 3fr),
  headers: ([字段], [类型], [说明]),
  rows: (
    ([`id`], [`string`], [说话的角色 ID，`null` 表示旁白]),
    ([`emotion`], [`string`], [角色表情（可选，不指定则保持当前表情）]),
    ([`text`], [`string`], [对话文本，支持富文本标记和换行符 `\n`]),
    ([`wait`], [`number`], [等待时间（毫秒），指定后自动推进到下一事件]),
  ),
  caption: [dialogue 事件字段说明],
)

#info-box(
  title: "简写形式",
  type: "success",
)[
  如果只需显示文本，可以直接使用字符串代替完整的事件对象：
  ```json
  "这是简写形式的对话"
  ```
  等同于：
  ```json
  { "action": "dialogue", "id": null, "text": "这是简写形式的对话" }
  ```
  使用上一个说话角色的 ID 和表情。
]

== remove 事件（移除角色）

```json
{
  "action": "remove",
  "id": "dingzhen"
}
```

移除指定角色，播放淡出动画后从场景中删除。

== background 事件（切换背景）

```json
{
  "action": "background",
  "id": "raincity0"
}
```

切换背景图片为 `background/{id}`。设置 `id: null` 可移除背景。

== bgm 事件（切换 BGM）

```json
{
  "action": "bgm",
  "id": "Home",
  "loop": true,
  "volume": 0.4,
  "fadeIn": true,
  "fadeTime": 2000
}
```

切换背景音乐，支持 `SoundManager.playBGM` 的所有选项。

== sound 事件（播放音效）

```json
{
  "action": "sound",
  "id": "door_open",
  "single": true,
  "volume": 0.6
}
```

播放音效，支持 `SoundManager.play` 的所有选项。

= 富文本标记

对话文本支持富文本样式标记，格式为 `$样式类名:文本内容$`。

== 标记语法

```
$highlight:重要内容$
$red:红色文字$
$big:大号文字$
```

== 转义字符

- `\\$` - 显示字面量 `$` 符号
- `\n` - 换行符

== 示例

```json
{
  "text": "欢迎来到$highlight:理塘$！\n这里的天空$blue:格外蓝$。"
}
```

渲染效果：
```html
<span>欢迎来到</span>
<span class="highlight">理塘</span>
<span>！</span>
<br>
<span>这里的天空</span>
<span class="blue">格外蓝</span>
<span>。</span>
```

= 键盘交互

对话播放时自动注册以下键盘快捷键：

#styled-table(
  columns: (1fr, 3fr),
  headers: ([按键], [功能]),
  rows: (
    ([`Enter / Space`], [推进到下一个对话事件]),
    ([`Ctrl（按住）`], [快进模式（跳过文本动画）]),
    ([`ESC`], [暂停游戏（显示暂停菜单）]),
  ),
  caption: [对话系统键盘快捷键],
)

#info-box(
  title: "快进机制",
  type: "info",
)[
  按住 Ctrl 键时，会以加速模式连续推进对话。初始间隔 200ms，后续间隔逐渐减小到 30ms，实现平滑加速效果。松开 Ctrl 键时停止快进。
]

= 使用场景与示例

== 场景 1：游戏剧情播放

```js
import Dialogue from './Dialogue.js'

async function playChapter1() {
  // 开场对话
  await Dialogue.play('chapter1_start')
  
  // 游戏玩法
  await startGameplay()
  
  // 结束对话
  await Dialogue.play('chapter1_end')
  
  // 解锁下一章
  unlockNextChapter()
}
```

== 场景 2：NPC 交互

```js
import Dialogue from './Dialogue.js'

class NPC {
  async interact() {
    if (this.questCompleted) {
      await Dialogue.play('npc_thanks')
    } else {
      await Dialogue.play('npc_quest')
    }
  }
}

// 游戏中触发
player.onInteract(() => {
  const npc = player.getNearbyNPC()
  if (npc) {
    npc.interact()
  }
})
```

== 场景 3：多分支对话

```js
import Dialogue from './Dialogue.js'

async function branchingDialogue() {
  await Dialogue.play('question')
  
  // 显示选择界面
  const choice = await showChoiceMenu(['选项A', '选项B', '选项C'])
  
  // 根据选择播放不同对话
  if (choice === 0) {
    await Dialogue.play('choice_a')
  } else if (choice === 1) {
    await Dialogue.play('choice_b')
  } else {
    await Dialogue.play('choice_c')
  }
}
```

== 场景 4：自定义对话样式

```css
/* 现代风格对话框 */
.dialogue-container.modern {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 30px;
}

.dialogue-container .title {
  font-size: 24px;
  font-weight: bold;
  color: var(--color, #ffcc00);
  margin-bottom: 5px;
}

.dialogue-container .subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 15px;
}

.dialogue-container .text {
  font-size: 18px;
  line-height: 1.6;
}

/* 高亮样式 */
.dialogue-container .text .highlight {
  color: #00d4ff;
  font-weight: bold;
}

.dialogue-container .text .red {
  color: #ff6b6b;
}

/* 角色立绘 */
.character {
  position: absolute;
  bottom: 0;
  height: 80%;
  object-fit: contain;
  transition: all 0.3s;
  filter: brightness(0.7);
}

.character.highlighted {
  filter: brightness(1);
  transform: scale(1.05);
}

.character.left {
  left: 0;
}

.character.right {
  right: 0;
  transform: scaleX(-1);
}

.character.remove {
  opacity: 0;
  transform: translateY(10%);
}
```

== 场景 5：对话脚本编写示例

```json
{
  "text_style": "modern",
  "auto_next_delay": 0,
  "events": [
    {
      "action": "background",
      "id": "home"
    },
    {
      "action": "bgm",
      "id": "Home",
      "volume": 0.4,
      "fadeIn": true
    },
    {
      "action": "add",
      "id": "protagonist",
      "key": "protagonist",
      "position": "right",
      "emotion": "normal",
      "title": "主角",
      "title_color": "#4a90e2"
    },
    {
      "action": "add",
      "id": "guide",
      "key": "guide",
      "position": "left",
      "emotion": "smile",
      "title": "向导",
      "subtitle": "神秘的向导",
      "title_color": "#ff9800"
    },
    {
      "action": "dialogue",
      "id": "guide",
      "text": "欢迎来到这个世界！"
    },
    {
      "action": "dialogue",
      "id": "protagonist",
      "emotion": "surprised",
      "text": "这是哪里？"
    },
    {
      "action": "dialogue",
      "id": "guide",
      "emotion": "normal",
      "text": "这里是$highlight:理塘$，一个充满奇迹的地方。"
    },
    {
      "action": "sound",
      "id": "magic_sound",
      "volume": 0.5
    },
    {
      "action": "dialogue",
      "id": null,
      "text": "一道光芒闪过...",
      "wait": 2000
    },
    {
      "action": "background",
      "id": "magic"
    },
    {
      "action": "dialogue",
      "id": "protagonist",
      "emotion": "amazed",
      "text": "太神奇了！"
    },
    {
      "action": "remove",
      "id": "guide"
    },
    {
      "action": "dialogue",
      "id": "protagonist",
      "emotion": "sad",
      "text": "他离开了..."
    }
  ]
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 不等待对话结束就执行下一步
  Dialogue.play('intro')
  startGame()  // 可能在对话中途开始游戏
  ```,
  good: ```js
  // 等待对话结束
  await Dialogue.play('intro')
  startGame()

  ```,
  explanation: [使用 `await` 等待对话结束后再执行后续逻辑。],
)

#best-practice(
  bad: ```js
  // 硬编码对话内容
  showDialogue('丁真', '你好！')
  ```,
  good: ```js
  // 使用 JSON 脚本
  await Dialogue.play('greeting')
  ```,
  explanation: "使用 JSON 脚本管理对话，便于修改和本地化。",
)

#best-practice(
  bad: ```json
  {
    "text": "欢迎来到理塘！这里的天空格外蓝。今天天气很好。让我们开始冒险吧！"
  }
  ```,
  good: ```json
  {
    "text": "欢迎来到理塘！"
  },
  {
    "text": "这里的天空格外蓝。"
  },
  {
    "text": "今天天气很好。\n让我们开始冒险吧！"
  }
  ```,
  explanation: [将长对话拆分为多个事件，控制节奏。使用 `\n` 控制换行。],
)

#best-practice(
  bad: ```json
  {
    "action": "add",
    "id": "char1",
    "key": "nonexist",
    "position": "left"
  }
  ```,
  good: ```json
  {
    "action": "add",
    "id": "dingzhen",
    "key": "dingzhen",
    "position": "left",
    "emotion": "normal"
  }
  ```,
  explanation: [确保角色资源存在于 `character/{key}/{emotion}.png`。],
)

= 注意事项

#info-box(
  title: "资源命名约定",
  type: "warning",
)[
  角色立绘资源路径格式为 `character/{key}/{emotion}.png`。例如：
  - `character/dingzhen/normal.png`
  - `character/dingzhen/happy.png`
  - `character/dingzhen/sad.png`
  
  确保 `key` 和 `emotion` 与文件名匹配。
]

#info-box(
  title: "事件执行顺序",
  type: "info",
)[
  事件按 `events` 数组顺序依次执行。大多数事件执行后自动推进到下一事件（非交互节点），只有 `dialogue` 事件会等待用户输入（除非设置了 `wait` 参数）。
]

#info-box(
  title: "键盘监听器管理",
  type: "warning",
)[
  对话播放时会注册键盘监听器，停止时自动清除。暂停游戏时会临时移除监听器，恢复时重新注册。这确保了按键不会冲突。
]

#info-box(
  title: "文本动画中断",
  type: "info",
)[
  文本逐字显示时，按下 Enter/Space 会立即显示完整文本（第一次），再按一次才推进到下一事件（第二次）。这是常见的对话系统交互模式。
]

#info-box(
  title: "角色位置计算",
  type: "info",
)[
  同一侧的多个角色会自动排列，后添加的角色在前方（z-index 更高）。高亮角色会放大并提高亮度。
]

#info-box(
  title: "旁白模式",
  type: "success",
)[
  设置 `id: null` 可显示旁白文本（无角色名称，文本居中，样式不同）。用于场景描述或系统提示。
]

= 技术细节

== 类结构

```js
class Dialogue {
  // 对话数据
  dialogueData = []
  eventIndex = 0
  
  // 角色管理
  characters = new Map()
  leftCharacter = []
  rightCharacter = []
  currentSpeaker = null
  
  // 状态
  isPlaying = false
  isWaiting = false
  textDisplaying = false
  
  // DOM 元素
  $dialogue = document.querySelector('.dialogue-container')
  $modernTitle = document.querySelector('.dialogue-container .title')
  $modernSubtitle = document.querySelector('.dialogue-container .subtitle')
  $modernText = document.querySelector('.dialogue-container .text')
  $touhou = document.querySelector('.dialogue-container .touhou-style-text')
  $background = document.querySelector('.dialogue-background')
  
  // 键盘监听器
  #keyboardListeners = []
  
  // 公共方法
  async play(dialogue) { /* ... */ }
  stop(force = false) { /* ... */ }
  next(skip = false) { /* ... */ }
  
  // 私有方法
  #processEvent(skip) { /* ... */ }
  #onAddCharacter(event) { /* ... */ }
  #onDialogue(event, skip) { /* ... */ }
  #onRemove(event) { /* ... */ }
  #onBackground(event) { /* ... */ }
  #onBGM(event) { /* ... */ }
  #onSoundEffect(event) { /* ... */ }
  #updateCharacterEmotion(character, emotion) { /* ... */ }
  #updatePosition() { /* ... */ }
  #updateBubble(text) { /* ... */ }
  #parseText($el, text) { /* ... */ }
  #addKeyboardListeners() { /* ... */ }
  #removeKeyboardListeners() { /* ... */ }
  #triggerSkip(key, delayTime) { /* ... */ }
}

export default new Dialogue()
```

== 文本显示动画

现代风格的文本逐字显示实现：

```js
const textDisplay = () => {
  // 处理快进（textCursor 为负数时）
  if (this.textCursor < 0) {
    this.#parseText(this.$modernText, text.slice(-this.textCursor))
    this.textCursor = text.length
  }
  
  let nextLetter = text.charAt(this.textCursor++)
  
  // 处理转义字符和样式标记
  if (nextLetter === '\\') {
    nextLetter = text.charAt(this.textCursor++)
  } else if (nextLetter === '$') {
    // 解析样式标记 $class:text$
    // ...
  }
  
  // 添加字符到 DOM
  const span = document.createElement('span')
  span.textContent = nextLetter
  this.$modernText.appendChild(span)
  
  // 递归调用
  this.textDisplayHandler = setTimeout(textDisplay, 32)
}
```

速度：每个字符间隔 32ms（约 31 字符/秒），换行符间隔 250ms。

== 快进机制

按住 Ctrl 键时的加速逻辑：

```js
#triggerSkip(key, delayTime) {
  const k = 0.6
  delayTime = k * delayTime + (1 - k) * 30  // 逐渐加速到 30ms
  
  this.next(true)  // 跳过文本动画
  
  setTimeout(() => {
    if (keyboard.isActive(key)) {
      this.#triggerSkip(key, delayTime)  // 继续快进
    }
  }, delayTime)
}
```

初始间隔 200ms，最小间隔 30ms，平滑过渡。

== 角色位置计算

左侧角色的位置计算：

```js
this.leftCharacter.forEach((character, index, { length }) => {
  const k = (index + 1) / length
  const offset = `var(--character-width) * ${k} - var(--character-offset)`
  
  character.$el.style.left = `calc(${offset})`
  character.$el.style.zIndex = 10 + index
  character.$el.style.transform = `translateY(${10 * (1 - k)}%)`
})
```

后添加的角色更靠前（z-index 更高），位置更靠中间。

== 依赖关系

`Dialogue.js` 依赖以下模块：

- `Asset.js`：加载对话脚本和角色立绘
- `Keyboard.js`：键盘输入处理
- `PauseManager.js`：监听暂停/恢复事件
- `SoundManager.js`：音频控制

被以下模块使用：

- 游戏主逻辑（`Game2D.js` 或关卡脚本）：播放剧情对话

== Promise 实现

使用 Promise 实现异步等待：

```js
async play(dialogue) {
  // ...
  const promise = new Promise(res => {
    this.onEnd = res  // 保存 resolve 函数
  })
  
  this.isPlaying = true
  this.#processEvent()
  
  return promise  // 返回 Promise
}

stop(force = false) {
  // ...
  if (!force) {
    setTimeout(() => this.onEnd?.(), 500)  // 触发 resolve
  }
}
```

== 暂停集成

监听 PauseManager 事件：

```js
constructor() {
  PauseManager.on('pause', () => {
    this.#removeKeyboardListeners()  // 移除键盘监听
  })
  
  PauseManager.on('resume', () => {
    setTimeout(() => this.#addKeyboardListeners(), 0)  // 恢复监听
  })
}
```

确保暂停时对话按键不会触发。
