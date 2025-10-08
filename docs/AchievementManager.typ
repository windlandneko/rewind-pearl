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
  title: "注意",
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
  import Achievement from './AchievementManager.js'
  
  // 玩家首次跳跃
  if (player.jumpCount === 1) {
    Achievement.add('first_jump')
  }
  
  // 完成第一章
  if (currentChapter === 1 && chapterCompleted) {
    Achievement.add('complete_chapter1')
  }
  
  // 收集所有物品
  if (player.items.length === totalItems) {
    Achievement.add('collect_all_items')
  }
  ```,
  notes: "如果成就已解锁，不会重复触发通知和音效。需要先通过登录系统设置当前用户名。",
)

#api(
  name: "has(id)",
  description: "查询指定成就是否已解锁。",
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
  
  // 在 UI 中显示成就状态
  function updateAchievementUI() {
    const achievements = ['first_jump', 'complete_chapter1', 'hidden_achievement']
    achievements.forEach(id => {
      const element = document.getElementById(id)
      if (Achievement.has(id)) {
        element.classList.add('unlocked')
      }
    })
  }
  ```,
  notes: [如果当前用户未登录，返回 `false`。],
)

#api(
  name: "remove(id)",
  description: "移除指定成就（调试或特殊情况使用）。",
  parameters: (
    (name: "id", type: "string", description: "成就的唯一标识符"),
  ),
  returns: (type: "boolean", description: [`true` 表示成功移除，`false` 表示用户未登录或成就不存在]),
  example: ```js
  // 调试时重置特定成就
  Achievement.remove('first_jump')
  
  // 撤销错误解锁的成就
  if (invalidUnlock) {
    Achievement.remove('invalid_achievement')
  }
  ```,
  notes: "此方法主要用于调试和特殊情况，正常游戏流程中不应使用。",
)

#api(
  name: "clear()",
  description: "重置当前用户的所有成就。",
  parameters: (),
  returns: (type: "boolean", description: [`true` 表示成功重置，`false` 表示用户未登录]),
  example: ```js
  // 游戏设置中的重置选项
  function resetAllAchievements() {
    if (confirm('确定要重置所有成就吗？')) {
      Achievement.clear()
      console.log('所有成就已重置')
    }
  }
  
  // 新游戏时清空成就（可选）
  function startNewGame() {
    if (clearAchievementsOnNewGame) {
      Achievement.clear()
    }
    initGame()
  }
  ```,
  notes: "此操作不可逆，建议在调用前向用户确认。",
)

#api(
  name: "values()",
  description: "获取当前用户所有已解锁成就的 ID 数组。",
  parameters: (),
  returns: (type: "string[]", description: "已解锁成就的 ID 数组，用户未登录时返回空数组"),
  example: ```js
  // 获取所有已解锁成就
  const unlockedAchievements = Achievement.values()
  console.log('已解锁成就:', unlockedAchievements)
  // 输出: ['first_jump', 'complete_chapter1', 'collect_all_items']
  
  // 计算解锁进度
  const totalAchievements = 50
  const unlocked = Achievement.values().length
  const progress = (unlocked / totalAchievements) * 100
  console.log(`成就进度: ${progress.toFixed(1)}%`)
  
  // 在成就界面显示
  function displayAchievements() {
    const unlocked = Achievement.values()
    allAchievements.forEach(achievement => {
      const element = renderAchievement(achievement)
      if (unlocked.includes(achievement.id)) {
        element.classList.add('unlocked')
      } else {
        element.classList.add('locked')
      }
      container.appendChild(element)
    })
  }
  ```,
  notes: "返回的数组顺序不固定，如需排序请在调用后处理。",
)

= 使用场景与示例

== 场景 1：玩家首次完成特定动作

```js
import Achievement from './AchievementManager.js'

class Player {
  constructor() {
    this.jumpCount = 0
    this.damageCount = 0
  }
  
  jump() {
    this.velocityY = -10
    this.jumpCount++
    
    // 首次跳跃成就
    if (this.jumpCount === 1) {
      Achievement.add('first_jump')
    }
    
    // 跳跃达人成就
    if (this.jumpCount === 1000) {
      Achievement.add('jump_master')
    }
  }
  
  onDamage() {
    this.health -= 10
    this.damageCount++
    
    // 不死传说成就（完成游戏且未受伤）
    if (this.damageCount === 0 && this.gameCompleted) {
      Achievement.add('no_damage_run')
    }
  }
}
```

== 场景 2：完成关卡时解锁成就

```js
import Achievement from './AchievementManager.js'

class Game {
  completeChapter(chapterNumber) {
    // 解锁章节完成成就
    Achievement.add(`complete_chapter${chapterNumber}`)
    
    // 检查是否完成所有章节
    const allChapters = [1, 2, 3, 4, 5]
    const allCompleted = allChapters.every(num => 
      Achievement.has(`complete_chapter${num}`)
    )
    
    if (allCompleted) {
      Achievement.add('complete_all_chapters')
    }
    
    // 速通成就
    if (this.chapterTime < 300) {  // 5分钟内完成
      Achievement.add(`speedrun_chapter${chapterNumber}`)
    }
  }
}
```

== 场景 3：收集类成就

```js
import Achievement from './AchievementManager.js'

class Player {
  constructor() {
    this.collectedItems = new Set()
  }
  
  collectItem(itemId) {
    this.collectedItems.add(itemId)
    
    // 收集特定物品
    if (itemId === 'golden_key') {
      Achievement.add('find_golden_key')
    }
    
    // 收集所有物品
    if (this.collectedItems.size === this.totalItems) {
      Achievement.add('collect_all_items')
    }
    
    // 收集里程碑
    if (this.collectedItems.size === 10) {
      Achievement.add('collector_bronze')
    }
    if (this.collectedItems.size === 50) {
      Achievement.add('collector_silver')
    }
    if (this.collectedItems.size === 100) {
      Achievement.add('collector_gold')
    }
  }
}
```

== 场景 4：隐藏成就和组合条件

```js
import Achievement from './AchievementManager.js'

class Game {
  checkHiddenAchievements() {
    // 连击大师（连续击败10个敌人不受伤）
    if (this.comboCount >= 10 && !this.damageDuringCombo) {
      Achievement.add('combo_master')
    }
    
    // 完美主义者（解锁所有其他成就）
    const requiredAchievements = [
      'complete_all_chapters',
      'collect_all_items',
      'no_damage_run',
      'speedrun_all_chapters'
    ]
    const allUnlocked = requiredAchievements.every(id => Achievement.has(id))
    if (allUnlocked) {
      Achievement.add('perfectionist')
    }
    
    // 秘密彩蛋成就
    if (this.player.x === 1337 && this.player.y === 420) {
      Achievement.add('secret_location')
    }
  }
}
```

== 场景 5：成就界面显示

```js
import Achievement from './AchievementManager.js'

// 定义所有成就
const allAchievements = [
  {
    id: 'first_jump',
    name: '第一次跳跃',
    description: '完成你的第一次跳跃',
    icon: '🦘'
  },
  {
    id: 'complete_chapter1',
    name: '第一章完成',
    description: '完成游戏第一章',
    icon: '📖'
  },
  {
    id: 'collect_all_items',
    name: '收藏家',
    description: '收集所有物品',
    icon: '🎁'
  },
  // ... 更多成就
]

// 渲染成就界面
function renderAchievementPage() {
  const container = document.getElementById('achievements')
  const unlocked = Achievement.values()
  
  allAchievements.forEach(achievement => {
    const isUnlocked = unlocked.includes(achievement.id)
    const element = document.createElement('div')
    element.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`
    element.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-info">
        <h3>${achievement.name}</h3>
        <p>${isUnlocked ? achievement.description : '???'}</p>
      </div>
      ${isUnlocked ? '<span class="checkmark">✓</span>' : ''}
    `
    container.appendChild(element)
  })
  
  // 显示统计
  const progress = document.getElementById('achievement-progress')
  progress.textContent = `${unlocked.length} / ${allAchievements.length}`
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 每次都直接操作 localStorage
  const data = JSON.parse(localStorage.getItem('rewind-pearl-achievements'))
  data[user]['first_jump'] = true
  localStorage.setItem('rewind-pearl-achievements', JSON.stringify(data))
  ```,
  good: ```js
  // 使用 AchievementManager 统一管理
  Achievement.add('first_jump')


  ```,
  explanation: "使用 AchievementManager 封装操作，自动处理通知、音效、数据同步等细节。",
)

#best-practice(
  bad: ```js
  // 不检查是否已解锁，重复解锁
  Achievement.add('first_jump')
  Achievement.add('first_jump')
  Achievement.add('first_jump')
  ```,
  good: ```js
  // 在解锁前检查状态
  if (!Achievement.has('first_jump')) {
    Achievement.add('first_jump')
  }
  ```,
  explanation: [虽然 `add` 方法内部会检查，但在逻辑层面先判断可以避免不必要的调用。],
)

#best-practice(
  bad: ```js
  // 硬编码成就 ID
  Achievement.add('achievement_123')
  if (Achievement.has('achievement_456')) {
    // ...
  }
  ```,
  good: ```js
  // 使用语义化的成就 ID
  const ACHIEVEMENTS = {
    FIRST_JUMP: 'first_jump',
    COMPLETE_CHAPTER1: 'complete_chapter1',
    COLLECT_ALL: 'collect_all_items'
  }
  
  Achievement.add(ACHIEVEMENTS.FIRST_JUMP)
  if (Achievement.has(ACHIEVEMENTS.COMPLETE_CHAPTER1)) {
    // ...
  }
  ```,
  explanation: "使用常量定义成就 ID，避免拼写错误，便于维护和重构。",
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
  explanation: [避免在循环中频繁调用 `add`，减少不必要的 localStorage 操作和检查。],
)

= 注意事项

#info-box(
  title: "用户登录状态",
  type: "warning",
)[
  所有成就操作都依赖于当前用户名（`localStorage['rewind-pearl-username']`）。如果用户未登录，所有操作都会返回 `false` 或空数组。确保在使用成就系统前完成用户登录流程。
]

#info-box(
  title: "成就 ID 命名规范",
  type: "info",
)[
  推荐使用小写字母和下划线的命名风格，如：
  - `first_jump`
  - `complete_chapter1`
  - `collect_all_items`
  - `no_damage_run`
  
  避免使用特殊字符、空格或中文，保持一致性。
]

#info-box(
  title: "数据持久化限制",
  type: "warning",
)[
  - `localStorage` 有存储容量限制（通常 5-10MB）
  - 用户清除浏览器缓存会导致成就数据丢失
  - 考虑实现云存档或导出/导入功能保护重要数据
]

#info-box(
  title: "通知系统依赖",
  type: "info",
)[
  `Achievement.add()` 内部调用了 `this.game.showNotification()` 和 `this.game.sound.play()`。需要确保：
  1. `Achievement.game` 已正确设置为游戏实例
  2. 游戏实例实现了 `showNotification` 方法
  3. `SoundManager` 已加载 `challenge_complete` 音效
]

#info-box(
  title: "多用户隔离",
  type: "success",
)[
  每个用户的成就数据完全独立，存储在同一个对象的不同键下。这意味着：
  - 支持多个玩家在同一设备上游戏
  - 切换用户时成就数据自动切换
  - 不会出现数据混淆或覆盖问题
]

= 技术细节

== 内部实现

```js
class Achievement {
  game  // 游戏实例引用
  
  // 私有 getter：获取当前用户名
  get #username() {
    return localStorage.getItem('rewind-pearl-username')
  }
  
  // 私有方法：获取所有用户的成就数据
  #getAllData() {
    try {
      const saved = localStorage.getItem('rewind-pearl-achievements')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }
  
  // 私有方法：保存成就数据
  #save(data) {
    localStorage.setItem('rewind-pearl-achievements', JSON.stringify(data))
  }
  
  // 公共方法：解锁成就
  add(id) {
    const user = this.#username
    if (!user) return false
    
    const allData = this.#getAllData()
    if (!allData[user]) allData[user] = {}
    
    // 仅在未解锁时触发通知
    if (!allData[user][id]) {
      this.game.showNotification(`成就已解锁：${id}`, {
        icon: '🏆',
        type: 'success',
      })
      this.game.sound.play('challenge_complete')
      
      allData[user][id] = true
      this.#save(allData)
    }
    
    return true
  }
}
```

== 数据结构设计

采用两层嵌套对象结构：

```
{
  [username]: {
    [achievementId]: boolean
  }
}
```

优点：
- 支持多用户独立管理
- JSON 序列化/反序列化简单
- 查询和更新性能良好
- 易于扩展和维护

== 依赖关系

`AchievementManager.js` 依赖以下模块：

- 浏览器 `localStorage` API

被以下模块使用：

- `Game2D.js` 或其他游戏逻辑模块：解锁成就
- 成就界面模块：查询和显示成就

间接依赖：

- `SoundManager.js`：播放成就解锁音效（通过 `this.game.sound`）
- 通知系统：显示成就解锁通知（通过 `this.game.showNotification`）

== 初始化要求

在使用成就系统前，需要完成以下初始化：

```js
import Achievement from './AchievementManager.js'

class Game {
  constructor() {
    // 关联游戏实例
    Achievement.game = this
  }
  
  showNotification(message, options) {
    // 实现通知显示逻辑
  }
}
```

== 错误处理

- `#getAllData()` 使用 try-catch 捕获 JSON 解析错误，失败时返回空对象
- 所有公共方法在用户未登录时返回安全的默认值（`false` 或空数组）
- 不会抛出异常，确保游戏逻辑不会因成就系统出错而中断

== 性能考虑

- 每次 `add()` 和 `remove()` 都会读写 `localStorage`，频繁调用可能影响性能
- 推荐在合适的时机批量解锁成就，避免在高频循环中调用
- `values()` 方法需要遍历所有成就，但通常成就数量不多，性能影响可忽略
- `has()` 方法性能良好，可放心在每帧调用
