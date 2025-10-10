// ============================================================================
// Dialogue.js 模块文档
// rewind-pearl 游戏引擎 - 对话系统
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "Dialogue.js",
  subtitle: "对话系统",
  authors: ("windlandneko",),
)

= 模块介绍

`Dialogue.js` 是 rewind-pearl 游戏引擎的对话系统模块，负责处理游戏剧情对话的播放、角色立绘显示、背景切换、音效触发等功能。支持现代风格和东方风格两种对话显示模式，提供丰富的文本样式标记和事件驱动的剧情推进机制。

== 核心特性

- *多风格支持*：现代风格（文字逐字显示）和东方风格（气泡对话框）
- *角色系统*：动态添加/移除角色，支持多表情切换
- *文本样式*：内联样式标记系统（`$样式类:文本$`）
- *事件驱动*：基于 JSON 配置的事件流控制剧情
- *键盘交互*：Enter、空格推进对话，Ctrl 快进，Esc 暂停
- *背景音乐*：支持对话中切换 BGM 和播放音效
- *自动播放*：可配置自动推进延迟
- *暂停集成*：与 PauseManager 联动

== 导入方式

```js
import Dialogue from './Dialogue.js'

// Dialogue 是单例，已自动实例化
await Dialogue.play('chapter1_intro')
```

= 对话数据结构

对话脚本使用 JSON 格式，存储在 `game/assets/dialogue/` 目录。

== 基本结构

```json
{
  "text_style": "modern",
  "auto_next_delay": 0,
  "events": [
    {
      "action": "add",
      "id": "alice",
      "key": "alice",
      "title": "爱丽丝",
      "subtitle": "冒险者",
      "title_color": "#ff6b9d",
      "position": "left",
      "emotion": "normal"
    },
    {
      "action": "dialogue",
      "id": "alice",
      "emotion": "happy",
      "text": "你好！欢迎来到这个世界。"
    },
    "简化写法，沿用上一说话者",
    {
      "action": "remove",
      "id": "alice"
    }
  ]
}
```

== 事件类型

#styled-table(
  columns: (1fr, 3fr),
  headers: ([事件类型], [说明]),
  rows: (
    ([`add`], [添加角色到场景]),
    ([`dialogue`], [显示对话文本]),
    ([`remove`], [移除角色]),
    ([`background`], [切换背景图片]),
    ([`bgm`], [播放背景音乐]),
    ([`sound`], [播放音效]),
  ),
  caption: [对话事件类型],
)

= API 参考

== 播放控制

#api(
  name: "play(dialogue)",
  description: "播放指定的对话脚本。",
  parameters: (
    (name: "dialogue", type: "string", description: [对话资源名称（相对于 `dialogue/` 目录）]),
  ),
  returns: (type: "Promise<void>", description: "对话结束时 resolve"),
  example: ```js
  // 播放对话并等待结束
  await Dialogue.play('chapter1_intro')
  console.log('对话结束')

  // 在关卡中使用
  if (game.levelData.introDialogue) {
    await Dialogue.play(game.levelData.introDialogue)
  }
  ```,
  notes: [
    - 如果对话已在播放中，会输出警告并直接返回 resolved Promise
    - 对话结束后自动清理键盘监听器和 DOM 状态
    - 自动注册键盘快捷键（Enter/Space 推进，Ctrl 快进）
  ],
)

#api(
  name: "stop(force)",
  description: "停止当前对话播放。",
  parameters: (
    (name: "force", type: "boolean", optional: true, description: [是否强制停止（不触发 `onEnd` 回调），默认 false]),
  ),
  returns: (type: "null", description: "无返回值"),
  notes: "清理对话状态、移除角色、移除键盘监听器。",
)

#api(
  name: "next(skip)",
  description: "推进到下一个事件。",
  parameters: (
    (name: "skip", type: "boolean", optional: true, description: "是否跳过文字逐字显示动画，默认 false"),
  ),
  returns: (type: "null", description: "无返回值"),
  notes: [
    - 如果对话未播放中，调用无效
    - 如果正在等待（`isWaiting`），`skip=false` 时忽略
    - 如果文字正在显示中，第一次调用会跳过动画，第二次调用推进到下一事件
  ],
)

== 状态查询

#styled-table(
  columns: (2fr, 1fr, 3fr),
  headers: ([属性], [类型], [说明]),
  rows: (
    ([`isPlaying`], [`boolean`], [对话是否正在播放]),
    ([`isWaiting`], [`boolean`], [是否处于等待状态（`wait` 事件）]),
    ([`eventIndex`], [`number`], [当前事件索引]),
    ([`currentSpeaker`], [`Object`], [当前说话者信息]),
  ),
)

= 事件详解

== add - 添加角色

```json
{
  "action": "add",
  "id": "alice",              // 角色唯一标识
  "key": "alice",             // 立绘资源键（对应 character/alice/ 目录）
  "title": "爱丽丝",          // 角色名称
  "subtitle": "冒险者",       // 副标题（可选）
  "title_color": "#ff6b9d",  // 名称颜色
  "position": "left",         // 位置：left/right
  "emotion": "normal"         // 初始表情
}
```

#info-box(
  title: "立绘资源",
  type: "info",
)[
  立绘图片需放置在 `game/assets/character/{key}/{emotion}.png`，例如 `character/alice/normal.png`、`character/alice/happy.png`。
]

== dialogue - 显示对话

```json
{
  "action": "dialogue",
  "id": "alice",            // 说话者 ID，null 表示旁白
  "emotion": "happy",       // 表情（可选，不写则沿用上次）
  "text": "你好世界！",     // 对话文本
  "wait": 1000              // 显示后等待时间（毫秒），可选
}
```

简化写法（字符串直接作为对话）：

```json
{
  "events": [
    { "action": "dialogue", "id": "alice", "text": "第一句" },
    "第二句（沿用 alice）",
    "第三句"
  ]
}
```

#info-box(
  type: "info",
)[
  设置 `"id": null` 可显示旁白（无角色名称，文本居中）。
]

== remove - 移除角色

```json
{
  "action": "remove",
  "id": "alice"
}
```

角色会播放淡出动画，500ms 后从 DOM 移除。

== background - 切换背景

```json
{
  "action": "background",
  "id": "forest"  // 背景资源名称（相对于 background/ 目录）
}
```

设置 `"id": null` 可清空背景。

== bgm - 播放背景音乐

```json
{
  "action": "bgm",
  "id": "battle_theme",
  "volume": 0.7,      // 音量（可选）
  "loop": true        // 是否循环（可选）
}
```

调用 `SoundManager.playBGM()`，详见 SoundManager 文档。

== sound - 播放音效

```json
{
  "action": "sound",
  "id": "door_open",
  "volume": 0.8
}
```

注意：快进模式（skip=true）时音效不会播放。

= 文本样式标记

对话文本支持内联样式标记：`$样式类名:文本内容$`

== 示例

```json
{
  "text": "这是$highlight:重要内容$，这是$red:红色文字$。"
}
```

渲染为：

```html
<span>这是</span>
<span class="highlight">重要内容</span>
<span>，这是</span>
<span class="red">红色文字</span>
<span>。</span>
```

== 转义

使用反斜杠 `\` 转义特殊字符：

```json
{
  "text": "价格：\\$100（转义 $ 符号）"
}
```

== 换行

使用 `\n` 换行（现代风格支持，东方风格自动换行）：

```json
{
  "text": "第一行\n第二行"
}
```

= 对话风格

== 现代风格 (modern)

```json
{
  "text_style": "modern"
}
```

特点：
- 文字逐字显示（每字 32ms）
- 角色名称和副标题在左上角
- 对话框位于屏幕底部
- 支持换行和富文本样式

== 东方风格 (touhou)

```json
{
  "text_style": "touhou"
}
```

特点：
- 气泡对话框（在角色旁边）
- 瞬间显示全部文字
- 文字呼吸动画效果
- 适合快节奏对话

= 键盘交互

#styled-table(
  columns: (1fr, 3fr),
  headers: ([按键], [功能]),
  rows: (
    ([`Enter / Space`], [推进到下一句对话]),
    ([`Ctrl`], [长按快进（跳过文字显示动画）]),
    ([`Esc`], [暂停对话，打开暂停菜单]),
  ),
  caption: [对话快捷键],
)

快进机制：
- 长按 Ctrl 触发连续快进
- 快进速度随时间递增（`k * delayTime + (1-k) * 30`）
- 松开 Ctrl 停止快进

= 与其他模块的交互

== PauseManager

对话系统监听 PauseManager 的 `pause` 和 `resume` 事件：

```js
PauseManager.on('pause', () => {
  // 移除键盘监听器，防止暂停时继续推进对话
  this.#removeKeyboardListeners()
})

PauseManager.on('resume', () => {
  // 恢复键盘监听器
  setTimeout(() => this.#addKeyboardListeners(), 0)
})
```

== SoundManager

对话系统调用 SoundManager 播放音乐和音效：

```js
SoundManager.playBGM(event.id, event)  // bgm 事件
SoundManager.play(event.id, event)     // sound 事件
```

== Asset

对话脚本和立绘资源通过 Asset 模块加载：

```js
// 检查对话资源是否存在
if (!Asset.has('dialogue/' + dialogue)) {
  console.warn('对话资源不存在:', dialogue)
  return Promise.resolve()
}

// 获取对话数据
this.dialogueData = Asset.get('dialogue/' + dialogue)

// 获取立绘图片
const image = Asset.get(`character/${key}/${emotion}`)
```

= 最佳实践

== 对话脚本组织

```
game/assets/dialogue/
├── chapter1/
│   ├── intro.json
│   ├── middle.json
│   └── ending.json
├── chapter2/
│   └── ...
└── common/
    ├── tutorial.json
    └── hints.json
```

加载时使用相对路径：

```js
await Dialogue.play('chapter1/intro')
```

== 角色配置复用

为常用角色定义配置对象：

```js
const CHARACTERS = {
  alice: {
    id: 'alice',
    key: 'alice',
    title: '爱丽丝',
    subtitle: '冒险者',
    title_color: '#ff6b9d',
  },
  bob: {
    id: 'bob',
    key: 'bob',
    title: '鲍勃',
    subtitle: '守卫',
    title_color: '#4a90e2',
  }
}

// 在对话 JSON 中使用
{
  "events": [
    { "action": "add", ...CHARACTERS.alice, "position": "left" }
  ]
}
```

== 对话与游戏逻辑结合

```js
// 在触发器中播放对话
class DialogueTrigger extends Trigger {
  trigger(game) {
    if (!this.triggered) {
      this.triggered = true
      Dialogue.play(this.dialogueId).then(() => {
        // 对话结束后的逻辑
        game.ref('door').open()
      })
    }
  }
}
```

== 分支对话设计

虽然 Dialogue 本身不支持分支，但可以通过程序控制：

```js
async function playConditionalDialogue(hasKey) {
  if (hasKey) {
    await Dialogue.play('with_key')
  } else {
    await Dialogue.play('without_key')
  }
}
```

= 常见问题

== 如何添加新的文本样式？

*答*：在 `game/style/dialogue.css` 中定义对应的 CSS 类：

```css
.dialogue-container .text .highlight {
  color: #ffcc00;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 204, 0, 0.5);
}
```

然后在对话文本中使用：`$highlight:重要$`。

== 如何实现打字机音效？

*答*：在 `#onDialogue()` 的 `textDisplay()` 函数中，每次添加字符时播放音效：

```js
span.textContent = nextLetter
this.$modernText.appendChild(span)
SoundManager.play('typewriter', { volume: 0.3 })
```

== 对话能否插入 CG 图片？

*答*：目前不支持。建议的实现方式：
1. 添加新的事件类型 `"action": "cg"`
2. 在 `#processEvent()` 中处理，显示全屏图片
3. 等待用户点击后继续对话

== 如何实现对话自动播放？

*答*：设置 `auto_next_delay`（毫秒）：

```json
{
  "text_style": "modern",
  "auto_next_delay": 2000,
  "events": [...]
}
```

对话显示完成后会自动在 2 秒后推进。
