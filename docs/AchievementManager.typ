// ============================================================================
// AchievementManager.js 模块文档
// rewind-pearl 游戏引擎 - 成就系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "AchievementManager.js 文档",
  subtitle: "成就系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`AchievementManager.js` 是 rewind-pearl 游戏引擎的成就管理模块，负责玩家成就的解锁、查询、移除和重置。该模块基于 `localStorage` 实现数据持久化，支持多用户独立管理，并与游戏通知系统和音效系统集成，提供完整的成就体验。

== 核心特性

- *多用户支持*：每个用户拥有独立的成就数据，互不干扰
- *持久化存储*：基于 `localStorage` 实现数据本地存储，刷新页面后保留
- *解锁通知*：成就解锁时自动显示通知和播放音效
- *查询接口*：支持查询单个成就状态或获取所有已解锁成就
- *管理功能*：支持移除单个成就或重置所有成就
- *单例模式*：全局唯一实例，统一成就状态管理

== 导入方式

```js
import Achievement from './AchievementManager.js'
```

#info-box(
  type: "warning",
)[
  `AchievementManager.js` 导出的是一个已实例化的单例对象（类名为 `Achievement`），可直接使用，无需 `new` 关键字。
]

= 数据存储结构

== localStorage 键名

成就系统使用以下 `localStorage` 键：

#styled-table(
  columns: (2fr, 3fr),
  headers: ([键名], [说明]),
  rows: (
    ([`rewind-pearl-achievements`], [存储所有用户的成就数据（JSON 格式）]),
    ([`rewind-pearl-username`], [当前登录的用户名]),
  ),
  caption: [localStorage 存储键名],
)

== 数据格式

```js
// localStorage['rewind-pearl-achievements']
{
  "player1": {
    "first_jump": true,
    "complete_chapter1": true,
    "collect_all_items": true
  },
  "player2": {
    "first_jump": true,
    "hidden_achievement": true
  }
}
```

每个用户的成就以对象形式存储，键为成就 ID，值为布尔值（已解锁为 `true`，未解锁则不存在该键）。

= API 参考

#api(
  name: "add(id)",
  description: "解锁指定成就。如果成就已解锁，则不会重复触发通知。成功解锁时会显示通知并播放音效。",
  parameters: (
    (name: "id", type: "string", description: "成就的唯一标识符"),
  ),
  returns: (type: "boolean", description: [`true` 表示操作成功，`false` 表示当前用户未登录]),
  example: ```js
  // 玩家首次跳跃
  if (player.jumpCount === 1) {
    Achievement.add('first_jump')
  }
  
  // 完成第一章
  if (currentChapter === 1 && chapterCompleted) {
    Achievement.add('complete_chapter1')
  }
  ```,
  notes: [
    如果成就已解锁，不会重复触发通知和音效。
    
    *用户登录状态*：所有成就操作都依赖于当前用户名（`localStorage['rewind-pearl-username']`）。如果用户未登录，操作会返回 `false`。确保在使用成就系统前完成用户登录流程。
    
    *通知系统依赖*：内部调用了 `this.game.showNotification()` 和 `this.game.sound.play('challenge_complete')`。需要确保：
    1. `Achievement.game` 已正确设置为游戏实例
    2. 游戏实例实现了 `showNotification` 方法
    3. `SoundManager` 已加载音效资源
  ],
)

#api(
  name: "has(id)",
  description: "查询指定成就是否已解锁。如果当前用户未登录，返回 `false`。",
  parameters: (
    (name: "id", type: "string", description: "成就的唯一标识符"),
  ),
  returns: (type: "boolean", description: [`true` 表示已解锁，`false` 表示未解锁或用户未登录]),
  example: ```js
  // 检查成就状态
  if (Achievement.has('first_jump')) {
    console.log('玩家已解锁首次跳跃成就')
  }
  
  // 条件性解锁隐藏成就
  if (Achievement.has('complete_chapter1') && 
      Achievement.has('collect_all_items')) {
    Achievement.add('perfect_chapter1')
  }
  ```,
)

#api(
  name: "remove(id)",
  description: "移除指定成就。此方法主要用于调试和特殊情况，正常游戏流程中不应使用。",
  parameters: (
    (name: "id", type: "string", description: "成就的唯一标识符"),
  ),
  returns: (type: "boolean", description: [`true` 表示成功移除，`false` 表示用户未登录或成就不存在]),
  example: ```js
  // 调试时重置特定成就
  Achievement.remove('first_jump')
  ```,
)

#api(
  name: "clear()",
  description: "重置当前用户的所有成就。此操作不可逆，建议在调用前向用户确认。",
  parameters: (),
  returns: (type: "boolean", description: [`true` 表示成功重置，`false` 表示用户未登录]),
  example: ```js
  // 游戏设置中的重置选项
  if (confirm('确定要重置所有成就吗？')) {
    Achievement.clear()
  }
  ```,
)

#api(
  name: "values()",
  description: "获取当前用户所有已解锁成就的 ID 数组。返回的数组顺序不固定，如需排序请在调用后处理。",
  parameters: (),
  returns: (type: "string[]", description: "已解锁成就的 ID 数组，用户未登录时返回空数组"),
  example: ```js
  // 获取所有已解锁成就
  const unlocked = Achievement.values()
  console.log('已解锁成就:', unlocked)
  // 输出: ['first_jump', 'complete_chapter1']
  
  // 计算解锁进度
  const progress = (unlocked.length / totalAchievements) * 100
  ```,
)

= 使用场景

== 玩家动作触发

```js
class Player {
  jump() {
    this.jumpCount++
    if (this.jumpCount === 1) {
      Achievement.add('first_jump')
    }
  }
}
```

== 关卡完成检测

```js
class Game {
  completeChapter(chapterNumber) {
    Achievement.add(`complete_chapter${chapterNumber}`)
    
    // 检查是否完成所有章节
    const allCompleted = [1, 2, 3, 4, 5].every(num => 
      Achievement.has(`complete_chapter${num}`)
    )
    if (allCompleted) {
      Achievement.add('complete_all_chapters')
    }
  }
}
```

== 成就界面显示

```js
function renderAchievementPage() {
  const unlocked = Achievement.values()
  
  allAchievements.forEach(achievement => {
    const isUnlocked = unlocked.includes(achievement.id)
    const element = createAchievementElement(achievement, isUnlocked)
    container.appendChild(element)
  })
  
  // 显示进度
  document.getElementById('progress').textContent = 
    `${unlocked.length} / ${allAchievements.length}`
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 硬编码成就 ID
  Achievement.add('achievement_123')
  ```,
  good: ```js
  // 使用语义化常量
  const ACHIEVEMENTS = {
    FIRST_JUMP: 'first_jump',
    COMPLETE_CHAPTER1: 'complete_chapter1'
  }
  Achievement.add(ACHIEVEMENTS.FIRST_JUMP)
  ```,
  explanation: "使用常量定义成就 ID，避免拼写错误，便于维护。推荐使用小写字母和下划线命名，如 `first_jump`、`complete_chapter1`，避免特殊字符。",
)

#best-practice(
  bad: ```js
  // 在循环中频繁调用
  for (let i = 0; i < 1000; i++) {
    if (someCondition) {
      Achievement.add('some_achievement')
    }
  }
  ```,
  good: ```js
  // 在循环外判断并解锁
  let shouldUnlock = false
  for (let i = 0; i < 1000; i++) {
    if (someCondition) {
      shouldUnlock = true
      break
    }
  }
  if (shouldUnlock) {
    Achievement.add('some_achievement')
  }
  ```,
  explanation: [避免在循环中频繁调用 `add`，减少不必要的 localStorage 操作。],
)

= 技术细节

== 数据结构

采用两层嵌套对象结构，支持多用户独立管理：

```js
// localStorage['rewind-pearl-achievements']
{
  [username]: {
    [achievementId]: boolean
  }
}
```

每个用户的成就数据完全独立，切换用户时成就数据自动切换，不会出现数据混淆。

== 初始化

在使用成就系统前，需要关联游戏实例：

```js
class Game {
  constructor() {
    Achievement.game = this
  }
  
  showNotification(message, options) {
    // 实现通知显示逻辑
  }
}
```

== 依赖关系

- 直接依赖：浏览器 `localStorage` API
- 间接依赖：`SoundManager.js`（通过 `this.game.sound`）、通知系统（通过 `this.game.showNotification`）
- 被使用：游戏逻辑模块（`Prologue.js` 等）、成就界面模块

#info-box(
  type: "warning",
)[
  `localStorage` 有存储容量限制（通常 5-10MB），用户清除浏览器缓存会导致成就数据丢失。考虑实现云存档或导出/导入功能保护重要数据。
]
