// ============================================================================
// 对话脚本编写指南
// rewind-pearl 游戏 - 面向剧本创作人员
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "对话脚本编写指南",
  subtitle: "剧本创作参考文档",
  authors: ("windlandneko",),
)

= 快速入门

对话脚本是 JSON 格式的文本文件，用于描述游戏中的剧情对话。您无需编程知识，只需按照本指南的格式编写即可。

== 脚本文件放置位置

所有对话脚本放在 `game/assets/dialogue/` 目录下，建议按章节组织：

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

== 基本结构

每个对话脚本文件的基本结构如下：

```json
{
  "text_style": "modern",
  "auto_next_delay": null,
  "events": [
    // 事件列表写在这里
  ]
}
```

#styled-table(
  columns: (1.5fr, 3fr),
  headers: ([属性], [说明]),
  rows: (
    ([`text_style`], [对话显示风格：`"modern[`（现代风格，逐字显示）或 `]touhou"`（东方风格，气泡对话）]),
    ([`auto_next_delay`], [自动推进延迟（毫秒），设为 `null` 表示需要玩家手动推进]),
    ([`events`], [事件列表，按顺序执行]),
  ),
  caption: [脚本根属性],
)

#info-box(
  title: "注意",
  type: "warning",
)[
  - JSON 格式对语法要求严格，确保使用双引号 `""`，且不要有多余的逗号。
  - 建议使用专业编辑器（如 VSCode）编写脚本，以获得AI补全、语法高亮和错误提示。
]

= 事件类型详解

事件是对话脚本的核心，每个事件描述一个动作。常用的事件类型有：

#api(
  name_as_title: true,
  name: "添加角色 (add)",
  description: "在场景中添加一个角色立绘。",
  parameters: (
    (name: "action", type: "string", description: [固定为 `add`]),
    (name: "id", type: "string", description: "角色唯一标识符，用于后续引用该角色（可自定义）"),
    (name: "key", type: "string", description: [角色资源名称，对应 `assets/character/` 目录下的文件夹]),
    (name: "title", type: "string", optional: true, description: "角色名称，显示在对话框中"),
    (name: "subtitle", type: "string", optional: true, description: "角色副标题，显示在名称下方"),
    (name: "title_color", type: "string", optional: true, description: [名称颜色，HTML 颜色代码（如 `#ff6b9d`）]),
    (name: "position", type: "string", description: "角色位置：`left\[`（左侧）或 `\]right`（右侧）"),
    (name: "emotion", type: "string", description: "初始表情，需与资源文件名对应"),
  ),
  example: ```json
  {
    "action": "add",
    "id": "alice",
    "key": "alice",
    "title": "爱丽丝",
    "subtitle": "冒险者",
    "title_color": "#ff6b9d",
    "position": "left",
    "emotion": "normal"
  }
  ```,
  notes: [
    - 角色立绘图片需放在 `game/assets/character/{key}/{emotion}.png`
    - 例如：`key` 为 `alice`，`emotion` 为 `happy`，则图片路径为 `character/alice/happy.png`
    - 角色 ID 在整个脚本中必须唯一
  ],
)

#api(
  name_as_title: true,
  name: "显示对话 (dialogue)",
  description: "显示角色的对话内容。支持完整写法、简化写法和纯字符串三种格式。",
  parameters: (
    (name: "action", type: "string", optional: true, description: [可省略，默认为对话事件（写为 `dialogue`）]),
    (name: "id", type: "string | null", description: [说话者 ID，必须是已添加的角色；设为 `null` 表示旁白]),
    (name: "emotion", type: "string", optional: true, description: "说话时的表情，不填则保持上次表情"),
    (
      name: "text",
      type: "string | null",
      optional: true,
      description: [对话内容，支持 `\n` 换行和样式标记；设为 `null` 可清空对话框],
    ),
    (name: "title", type: "string", optional: true, description: "临时修改角色名称"),
    (name: "subtitle", type: "string", optional: true, description: "临时修改角色副标题"),
    (name: "title_color", type: "string", optional: true, description: "临时修改名称颜色"),
    (name: "wait", type: "number", optional: true, description: "显示后等待时间（毫秒），时间到后自动继续"),
  ),
  example: ```json
  // 完整写法
  {
    "action": "dialogue",
    "id": "alice",
    "emotion": "happy",
    "text": "你好！欢迎来到这个世界。"
  }

  // 简化写法（省略 action）
  {
    "id": "alice",
    "emotion": "smile",
    "text": "很高兴见到你！"
  }

  // 最简写法（纯字符串，沿用上一说话者）
  "继续说第二句话"

  // 旁白
  {
    "id": null,
    "text": "（于是转身向山里走去。）"
  }
  ```,
  notes: [
    - 将 `id` 设为 `null` 可显示旁白（无角色名称，文本居中）
    - 纯字符串写法会自动继承上一个说话者的 ID
    - 文本支持 `\n` 换行和样式标记（详见"文本样式标记"章节）
    - 设置 `wait` 参数可在显示后强制等待指定时间
  ],
)

#api(
  name_as_title: true,
  name: "移除角色 (remove)",
  description: "从场景中移除角色。角色会播放淡出动画后消失。",
  parameters: (
    (name: "action", type: "string", description: [固定为 `remove`]),
    (name: "id", type: "string", description: "要移除的角色 ID，必须是已添加的角色"),
  ),
  example: ```json
  {
    "action": "remove",
    "id": "alice"
  }
  ```,
  notes: [
    - 角色会播放 500ms 的淡出动画
    - 只能移除已通过 `add` 事件添加的角色
  ],
)

#api(
  name_as_title: true,
  name: "切换背景 (background)",
  description: "切换场景背景图片。",
  parameters: (
    (name: "action", type: "string", description: [固定为 `background`]),
    (
      name: "id",
      type: "string | null",
      description: [背景资源名称（相对于 `background/` 目录）；设为 `null` 可清空背景],
    ),
  ),
  example: ```json
  // 切换到森林背景
  {
    "action": "background",
    "id": "forest"
  }

  // 清空背景
  {
    "action": "background",
    "id": null
  }
  ```,
  notes: [
    - 背景图片需放在 `game/assets/background/` 目录
    - 设为 `null` 可清空背景，显示默认颜色
  ],
)

#api(
  name_as_title: true,
  name: "播放背景音乐 (bgm)",
  description: "播放或切换背景音乐。",
  parameters: (
    (name: "action", type: "string", description: [固定为 `bgm`]),
    (name: "id", type: "string", description: [音乐资源名称（相对于 `audio/` 目录）]),
    (name: "volume", type: "number", optional: true, description: "音量（0.0 ~ 1.0），默认 1.0"),
    (name: "loop", type: "boolean", optional: true, description: [是否循环播放，默认 `true`]),
  ),
  example: ```json
  {
    "action": "bgm",
    "id": "battle_theme",
    "volume": 0.7,
    "loop": true
  }
  ```,
  notes: [
    - 音乐文件需放在 `game/assets/audio/` 目录
    - 支持 MP3、OGG 等常见音频格式
    - 切换 BGM 时会自动停止之前的音乐
  ],
)

#api(
  name_as_title: true,
  name: "播放音效 (sound)",
  description: "播放音效。注意：快进模式下音效不会播放。",
  parameters: (
    (name: "action", type: "string", description: [固定为 `sound`]),
    (name: "id", type: "string", description: [音效资源名称（相对于 `soundEffects/` 目录）]),
    (name: "volume", type: "number", optional: true, description: "音量（0.0 ~ 1.0），默认 1.0"),
  ),
  example: ```json
  {
    "action": "sound",
    "id": "door_open",
    "volume": 0.8
  }
  ```,
  notes: [
    - 音效文件需放在 `game/assets/soundEffects/` 目录
    - 玩家按住 Ctrl 快进时，音效不会播放
    - 适合用于门开关、脚步声等场景音效
  ],
)

= 文本样式标记

== 转义字符与换行

使用反斜杠 `\` 转义特殊字符（如 `\` 符号本身或 `$` 符号）。

使用`\n` 换行。

```json
{
  "text": "使用反斜杠 \\\\ 转义特殊字符，如 \\\\ 符号本身或 \\$ 符号。"
},
{
  "text": "第一行\n第二行\n第三行"
}
```

#info-box(type: "warning")[由于 JSON 语法本身就带有一层转义，所以反斜杠需要写成 `\\` 才能表示 `\` 字符。]

== 样式标记

对话文本支持内联样式标记，格式为：`$样式类名:文本内容$`

```json
{
  "text": "这是$highlight:重要内容$，这是$red:红色文字$。"
}
```

实际渲染效果（HTML）：

```html
<span>这是</span>
<span class="highlight">重要内容</span>
<span>，这是</span>
<span class="red">红色文字</span>
<span>。</span>
```

两种风格均支持样式标记。

== 常用样式类

以下是游戏中预定义的样式类（在 `game/style/dialogue.css` 中定义）：

#styled-table(
  columns: (1fr, 3fr),
  headers: ([样式类], [效果说明]),
  rows: (
    ([`u`], [下划线]),
    ([`italic`], [斜体]),
    ([`wow`], [强调文字，哇嗷！]),
  ),
  caption: [预定义样式类],
)

#info-box(
  title: "添加新样式",
  type: "tip",
)[
  如需添加新的文本样式，可以在 `game/style/dialogue.css` 中添加对应的 CSS 类定义。
]

= 玩家交互

== 键盘操作

玩家在对话过程中可使用以下按键：

#styled-table(
  columns: (1.5fr, 3fr),
  headers: ([按键], [功能]),
  rows: (
    ([`Enter` / `Space`], [推进到下一句对话]),
    ([`Ctrl`（长按）], [快进（跳过文字显示动画）]),
    ([`Esc`], [暂停对话，打开暂停菜单]),
  ),
  caption: [对话快捷键],
)

== 交互节点与非交互节点

- *交互节点*：包含 `text` 的对话事件、或包含 `wait` 的等待事件称为交互节点。

  需要玩家按键操作才会继续，或等待超时后自动继续。

- *非交互节点*：不是交互节点的事件，如添加角色、移除角色、切换背景、播放音乐等。

  效果立即执行，自动继续到下一个事件

= 脚本示例

以下是一个完整的对话脚本示例，展示了各种事件的组合使用：

```json
{
  "text_style": "modern",
  "auto_next_delay": null,
  "events": [
    {
      "action": "background",
      "id": "forest"
    },
    {
      "action": "bgm",
      "id": "peaceful_theme",
      "volume": 0.6
    },
    {
      "action": "add",
      "id": "reimu",
      "title": "博丽灵梦",
      "subtitle": "不可思议的巫女",
      "key": "reimu",
      "emotion": "normal",
      "position": "left"
    },
    {
      "id": "reimu",
      "text": "又有新的异变发生了..."
    },
    {
      "id": "reimu",
      "emotion": "surprise",
      "text": "这次的敌人好像$highlight:非常强大$。"
    },
    "我需要更多的帮助！",
    "要是魔理沙在就好了。",
    {
      "id": null,
      "text": "（这时，远处传来熟悉的脚步声。）"
    }
    {
      "action": "add",
      "id": "marisa",
      "title": "雾雨魔理沙",
      "subtitle": "普通的魔法使",
      "key": "marisa",
      "emotion": "smile",
      "position": "right"
    },
    {
      "id": "marisa",
      "text": "嘿，灵梦！我来帮你了！"
    },
    {
      "id": "reimu",
      "emotion": "happy",
      "text": "太好了，有你在我就放心了。"
    },
    {
      "id": null,
      "text": "（两人于是转身向山里走去。）"
    },
    {
      "action": "sound",
      "id": "footstep",
      "volume": 0.5
    },
    {
      "action": "remove",
      "id": "reimu"
    },
    {
      "action": "remove",
      "id": "marisa"
    }
  ]
}
```

= 最佳实践

== 保持角色 ID 唯一性

在整个脚本中，每个角色的 `id` 必须唯一。建议使用角色的英文名或拼音作为 ID。

#best-practice(
  bad: ```json
  {
    "action": "add",
    "id": "person",
    "key": "alice"
  },
  {
    "action": "add",
    "id": "person",
    "key": "bob"
  }
  ```,
  good: ```json
  {
    "action": "add",
    "id": "A",
    "key": "alice"
  },
  {
    "action": "add",
    "id": "B",
    "key": "bob"
  }
  ```,
  explanation: "使用有意义的 ID 便于后续引用和维护。",
)

== 合理使用简化写法

同一角色连续对话时，使用字符串简化写法可以让脚本更简洁。

#best-practice(
  bad: ```json
  {
    "action": "dialogue",
    "id": "alice",
    "text": "宝宝肚肚打雷啦"
  },
  {
    "action": "dialogue",
    "id": "alice",
    "text": "肚肚宝宝打雷啦"
  },
  {
    "action": "dialogue",
    "id": "alice",
    "text": "雷雷宝宝打肚肚"
  },
  {
    "action": "dialogue",
    "id": "alice",
    "text": "肚肚宝宝打雷雷"
  }
  ```,
  good: ```json
  {
    "id": "alice",
    "text": "宝宝肚肚打雷啦"
  },
  "肚肚宝宝打雷啦",
  "雷雷宝宝打肚肚",
  "肚肚宝宝打雷雷"














  ```,
  explanation: "字符串会自动继承上一个说话者，代码更简洁易读。",
)

== 表情资源对应

使用的表情名称必须与 `game/assets/character/{key}/` 目录下的图片文件名对应。

#best-practice(
  bad: ```json
  {
    "id": "alice",
    "emotion": "happy123"
  }
  ```,
  good: ```json
  {
    "id": "alice",
    "emotion": "happy"
  }
  ```,
  explanation: [确保 `character/alice/happy.png` 文件存在。],
)


== 合理设置等待时间

使用 `wait` 参数可以在重要剧情节点添加停顿：

```json
{
  "id": "alice",
  "emotion": "shock",
  "text": "这...这不可能！",
  "wait": 1500
}
```

== 善用旁白

使用旁白描述场景变化、角色动作等非对话内容。

将 `id` 设为 `null` 即可识别为旁白，文字会变暗并隐藏名称栏。

```json
{
  "events": [
    {
      "id": null,
      "text": "夜幕降临，月光洒在森林中。"
    },
    {
      "id": null,
      "text": "远处传来奇怪的声音。"
    }
  ]
}
```

== 背景音乐与氛围营造

在剧情的关键节点切换 BGM，营造不同的氛围：

```json
{
  "events": [
    {
      "action": "bgm",
      "id": "peaceful_theme"
    },

    // ...平静的对话...

    {
      "action": "bgm",
      "id": "battle_theme",
      "volume": 0.8
    },
    {
      "id": "boss",
      "text": "你的末日到了！"
    }
  ]
}
```

= 常见问题

== Q：为什么脚本无法加载？

*A*：首先检查 JSON 语法是否正确：

#info-box(
  title: "常见 JSON 错误",
  type: "warning",
)[
  - *尾随逗号*：最后一个元素后不能有逗号。

    ```json
    {
      "events": [
        {...},
        {...},  // ← 这个逗号要删除
      ], // ← 这个逗号也要删除
    }
    ```

  - *引号使用*：所有字符串必须用双引号 `""`，不能用单引号 `''`
    ```json
    {
      'id': 'alice',  // 错误
      "id": "alice"   // 正确
    }
    ```

  - *注释*：JSON 标准不支持注释，不要在脚本中写 `//` 或 `/* */`
    ```json
    {
      // 这是注释，不要添加
      "id": "alice" /* 也不要添加这种 */
    }
    ```
]

打开控制台查看报错信息，如果未出现语法解析错误，接着检查以下几点：

1. 确认脚本文件路径和名称是否正确，是否放在了 `game/assets/dialogue/` 目录下。
2. 是否正确填写了 `manifest.json` 。
3. 确认脚本中的角色 ID 和资源名称是否正确，资源文件是否存在。
4. 确认关卡中正确配置了对话 ID 及触发条件。

== Q: 如何实现角色左右移动位置？

*A*：目前不支持角色在左右之间进行移动。如需切换位置，可以先 `remove` 再 `add` 到新位置：

```json
{
  "events": [
    {
      "action": "remove",
      "id": "alice"
    },
    {
      "action": "add",
      "id": "alice",
      "key": "alice",
      "position": "right",
      "emotion": "normal"
    }
  ]
}
```

== Q: 能否同时显示多个角色？

*A*：可以。左右两侧可以随意放置任意多个角色，引擎会自动计算位置与遮挡关系。

#info-box(type: "tip")[后添加的角色将会显示在最前面。]

== Q: 如何实现选择分支？

*A*：对话系统本身不支持选择分支，你可以直接在游戏逻辑内控制播放不同的对话脚本。

== Q: 文本太长怎么办？

*A*：使用 `\n` 换行，或将长对话拆分成多段。

== Q: 如何测试我的脚本？

*A*：将脚本文件放入 `game/assets/dialogue/` 目录后，更新 `manifest.json` 文件，然后在关卡编辑器中填写对话ID并导出至关卡文件即可，后续修改只需刷新页面即可生效。

= 附录

== 事件速查表

#styled-table(
  columns: (1fr, 2fr, 3fr),
  headers: ([事件类型], [action 值], [用途]),
  rows: (
    ([添加角色], [`add`], [在场景中加入新角色]),
    ([显示对话], [`dialogue` 或 不填], [显示角色对话或旁白]),
    ([移除角色], [`remove`], [从场景中移除角色]),
    ([切换背景], [`background`], [更换场景背景图片]),
    ([播放音乐], [`bgm`], [播放或切换背景音乐]),
    ([播放音效], [`sound`], [播放音效]),
  ),
)

