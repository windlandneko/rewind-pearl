// ============================================================================
// SaveManager.js 模块文档
// rewind-pearl 游戏引擎 - 存档管理系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "SaveManager.js 文档",
  subtitle: "存档管理系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`SaveManager.js` 是 rewind-pearl 游戏引擎的存档管理模块，负责处理存档相关的 UI 渲染和用户交互逻辑。该模块提供存档列表展示、存档加载、存档删除和存档命名等功能，基于 `localStorage` 实现多用户独立存档管理。

== 核心特性

- *多用户支持*：每个用户拥有独立的存档列表，互不干扰
- *存档列表渲染*：动态生成存档项 UI，显示存档名称、时间和关卡信息
- *交互式操作*：支持点击加载存档、删除存档
- *存档命名*：提供友好的存档命名提示框
- *时间格式化*：自动格式化存档时间戳为可读格式
- *静态工具类*：所有方法都是静态方法，无需实例化

== 导入方式

```js
import SaveManager from './SaveManager.js'
```

#info-box(
  title: "注意",
  type: "info",
)[
  `SaveManager.js` 是一个静态工具类，所有方法都是静态方法，通过类名直接调用，无需创建实例。
]

= 数据存储结构

== localStorage 键名

存档系统使用以下 `localStorage` 键：

#styled-table(
  columns: (2fr, 3fr),
  headers: ([键名], [说明]),
  rows: (
    ([`rewind-pearl-savings`], [存储所有用户的存档列表（JSON 格式）]),
    ([`rewind-pearl-username`], [当前登录的用户名]),
    ([`rewind-pearl-autosave-{username}`], [用户的自动存档数据]),
  ),
  caption: [localStorage 存储键名],
)

== 存档数据格式

```js
// localStorage['rewind-pearl-savings']
{
  "player1": [
    {
      "name": "存档_01-15 14:30:45",
      "data": {
        "timestamp": 1736922645000,
        "levelData": {
          "name": "第一章 - 开端",
          "id": "chapter1_start"
        },
        "playerData": { /* 玩家状态 */ },
        "gameState": { /* 游戏状态 */ }
      }
    },
    {
      "name": "通关前存档",
      "data": { /* ... */ }
    }
  ],
  "player2": [
    // player2 的存档列表
  ]
}
```

每个存档包含：
- `name`：存档名称（用户输入或自动生成）
- `data`：存档数据对象
  - `timestamp`：存档时间戳
  - `levelData`：关卡信息
  - `playerData`：玩家状态
  - `gameState`：游戏状态

= API 参考

#api(
  name: "loadSaveList(container, onLoad, onDelete)",
  description: "在指定容器中渲染存档列表 UI，并绑定加载和删除事件。",
  parameters: (
    (name: "container", type: "HTMLElement", description: "存档列表的容器元素"),
    (name: "onLoad", type: "Function", description: [加载存档的回调函数，接收存档数据对象作为参数：`(saveData) => void`]),
    (name: "onDelete", type: "Function", optional: true, description: [删除存档的回调函数，接收存档名称作为参数：`(saveName) => void`]),
  ),
  returns: (type: "void", description: "无返回值"),
  example: ```js
  import SaveManager from './SaveManager.js'
  
  const saveList = document.getElementById('save-list')
  
  SaveManager.loadSaveList(
    saveList,
    // 加载存档回调
    (saveData) => {
      console.log('加载存档:', saveData)
      // 将存档数据写入自动存档
      const currentUser = localStorage.getItem('rewind-pearl-username')
      localStorage.setItem(
        'rewind-pearl-autosave-' + currentUser,
        JSON.stringify(saveData)
      )
      // 刷新页面加载游戏
      location.reload()
    },
    // 删除存档回调（可选）
    (saveName) => {
      console.log('已删除存档:', saveName)
      // 可在此处添加额外逻辑
    }
  )
  ```,
  notes: [此方法会修改 DOM 结构并定义全局函数 `loadSelectedSave` 和 `deleteSave`，用于处理点击事件。],
)

#api(
  name: "showSavePrompt(onSave)",
  description: "显示存档命名提示框，用户输入存档名称后触发回调。",
  parameters: (
    (name: "onSave", type: "Function", description: [保存存档的回调函数，接收用户输入的存档名称作为参数：`(saveName) => void`]),
  ),
  returns: (type: "void", description: "无返回值"),
  example: ```js
  import SaveManager from './SaveManager.js'
  
  // 在暂停菜单的保存按钮点击时
  document.getElementById('save-btn').addEventListener('click', () => {
    SaveManager.showSavePrompt((saveName) => {
      console.log('保存存档:', saveName)
      game.saveGame(saveName)
    })
  })
  
  // 快速保存（使用默认名称）
  function quickSave() {
    const defaultName = `快速存档_${Date.now()}`
    game.saveGame(defaultName)
  }
  ```,
  notes: [默认存档名称为 `存档_MM-DD HH:MM:SS` 格式。用户取消输入或输入空白时不会触发回调。],
)

#api(
  name: "formatTime(timestamp)",
  description: "将时间戳格式化为本地化的可读时间字符串。",
  parameters: (
    (name: "timestamp", type: "number", description: "时间戳（毫秒）"),
  ),
  returns: (type: "string", description: [格式化后的时间字符串，如 `2025/01/15 14:30`]),
  example: ```js
  import SaveManager from './SaveManager.js'
  
  const timestamp = 1736922645000
  const formatted = SaveManager.formatTime(timestamp)
  console.log(formatted)  // "2025/01/15 14:30"
  
  // 显示存档时间
  const saveTime = SaveManager.formatTime(saveData.timestamp)
  document.getElementById('save-time').textContent = `保存于：${saveTime}`
  
  // 处理无效时间戳
  const invalid = SaveManager.formatTime(null)
  console.log(invalid)  // "未知时间"
  ```,
  notes: [如果传入 `null`、`undefined` 或无效时间戳，返回 `'未知时间'`。],
)

= 渲染的 UI 结构

`loadSaveList` 方法生成的 HTML 结构：

```html
<div class="save-list">
  <!-- 有存档时 -->
  <div class="save-item" onclick="loadSelectedSave('player1', 0)">
    <div class="save-content">
      <div class="save-name">存档_01-15 14:30:45</div>
      <div class="save-info">
        <span class="save-time">2025/01/15 14:30</span>
        <span class="save-level">第一章 - 开端</span>
      </div>
    </div>
    <button class="delete-save-btn" 
            onclick="event.stopPropagation(); deleteSave('player1', 0)">
      删除
    </button>
  </div>
  
  <!-- 无存档时 -->
  <div class="no-saves">暂无存档</div>
  
  <!-- 用户未登录时 -->
  <div class="no-saves">用户未登录</div>
</div>
```

= 使用场景与示例

== 场景 1：暂停菜单中的存档管理

`PauseManager.js` 使用 SaveManager 实现存档加载功能。

```js
import SaveManager from './SaveManager.js'

class PauseManager {
  #onLoadGame() {
    const saveList = document.getElementById('save-list')
    this.$saveManagerModal?.classList.add('show')
    
    SaveManager.loadSaveList(saveList, (saveData) => {
      const currentUser = localStorage.getItem('rewind-pearl-username')
      // 将选中的存档写入自动存档
      localStorage.setItem(
        'rewind-pearl-autosave-' + currentUser,
        JSON.stringify(saveData)
      )
      // 标记为已保存退出（避免重复自动保存）
      this.game.onSavedExit = true
      // 刷新页面重新加载游戏
      location.reload()
    })
  }
  
  #onSaveGame() {
    SaveManager.showSavePrompt((saveName) => {
      this.game.saveGame(saveName)
    })
  }
}
```

== 场景 2：主菜单的继续游戏功能

```js
import SaveManager from './SaveManager.js'

class MainMenu {
  showLoadGameMenu() {
    const modal = document.getElementById('load-game-modal')
    const saveList = document.getElementById('save-list')
    
    modal.classList.add('show')
    
    SaveManager.loadSaveList(
      saveList,
      (saveData) => {
        // 加载存档并开始游戏
        this.loadGameFromSave(saveData)
        modal.classList.remove('show')
      },
      (saveName) => {
        // 删除存档后的额外处理
        console.log(`存档"${saveName}"已删除`)
        this.updateSaveCount()
      }
    )
  }
  
  loadGameFromSave(saveData) {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    localStorage.setItem(
      'rewind-pearl-autosave-' + currentUser,
      JSON.stringify(saveData)
    )
    location.assign('./game/index.html')
  }
}
```

== 场景 3：游戏内保存功能

```js
import SaveManager from './SaveManager.js'

class Game {
  saveGame(saveName, silent = false, isAuto = false) {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    if (!currentUser) {
      console.warn('用户未登录，无法保存')
      return false
    }
    
    // 构建存档数据
    const saveData = {
      timestamp: Date.now(),
      levelData: {
        name: this.currentLevel.name,
        id: this.currentLevel.id
      },
      playerData: this.player.serialize(),
      gameState: this.serialize()
    }
    
    // 获取现有存档列表
    const savingsData = localStorage.getItem('rewind-pearl-savings')
    const savings = savingsData ? JSON.parse(savingsData) : {}
    if (!savings[currentUser]) savings[currentUser] = []
    
    // 添加新存档
    savings[currentUser].push({
      name: saveName,
      data: saveData
    })
    
    // 保存到 localStorage
    localStorage.setItem('rewind-pearl-savings', JSON.stringify(savings))
    
    if (!silent) {
      this.showNotification(`存档"${saveName}"保存成功`, {
        type: 'success',
        icon: '💾'
      })
    }
    
    return true
  }
  
  quickSave() {
    const saveName = `快速存档_${SaveManager.formatTime(Date.now())}`
    this.saveGame(saveName)
  }
}
```

== 场景 4：自定义存档 UI 样式

```css
/* 存档列表样式 */
.save-list {
  max-height: 400px;
  overflow-y: auto;
}

.save-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-item:hover {
  background: #e0e0e0;
}

.save-content {
  flex: 1;
}

.save-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.save-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.delete-save-btn {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-save-btn:hover {
  background: #d32f2f;
}

.no-saves {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
```

== 场景 5：存档导出/导入功能

```js
import SaveManager from './SaveManager.js'

class SaveExporter {
  // 导出存档为 JSON 文件
  exportSave(saveIndex) {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    const savingsData = localStorage.getItem('rewind-pearl-savings')
    const savings = JSON.parse(savingsData)
    const save = savings[currentUser][saveIndex]
    
    const json = JSON.stringify(save, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${save.name}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }
  
  // 导入存档
  importSave(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const save = JSON.parse(e.target.result)
        const currentUser = localStorage.getItem('rewind-pearl-username')
        const savingsData = localStorage.getItem('rewind-pearl-savings')
        const savings = savingsData ? JSON.parse(savingsData) : {}
        
        if (!savings[currentUser]) savings[currentUser] = []
        savings[currentUser].push(save)
        
        localStorage.setItem('rewind-pearl-savings', JSON.stringify(savings))
        alert('存档导入成功')
        
        // 重新加载存档列表
        const saveList = document.getElementById('save-list')
        SaveManager.loadSaveList(saveList, loadCallback, deleteCallback)
      } catch (error) {
        alert('存档文件格式错误')
      }
    }
    reader.readAsText(file)
  }
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 直接操作 localStorage
  const saves = JSON.parse(localStorage.getItem('rewind-pearl-savings'))
  saves[user].forEach(save => {
    const div = document.createElement('div')
    div.textContent = save.name
    container.appendChild(div)
  })
  ```,
  good: ```js
  // 使用 SaveManager 统一管理
  SaveManager.loadSaveList(container, onLoad, onDelete)



  ```,
  explanation: "使用 SaveManager 自动处理 UI 渲染、事件绑定、用户登录检查等细节。",
)

#best-practice(
  bad: ```js
  // 硬编码时间格式
  const date = new Date(timestamp)
  const formatted = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  ```,
  good: ```js
  // 使用 SaveManager 的格式化方法
  const formatted = SaveManager.formatTime(timestamp)

  ```,
  explanation: "使用统一的时间格式化方法，保持一致性并自动处理边界情况。",
)

#best-practice(
  bad: ```js
  // 不处理用户取消输入
  const name = prompt('输入存档名称')
  game.saveGame(name)  // name 可能为 null
  ```,
  good: ```js
  // 使用 SaveManager 自动处理
  SaveManager.showSavePrompt((saveName) => {
    game.saveGame(saveName)  // saveName 保证非空
  })
  ```,
  explanation: [`showSavePrompt` 自动处理用户取消和空输入，回调只在有效输入时触发。],
)

#best-practice(
  bad: ```js
  // 不提供默认存档名称
  const name = prompt('输入存档名称')
  ```,
  good: ```js
  // 提供友好的默认名称
  SaveManager.showSavePrompt((saveName) => {
    game.saveGame(saveName)
  })
  // 默认名称：存档_01-15 14:30:45
  ```,
  explanation: "提供合理的默认存档名称，方便用户快速保存。",
)

= 注意事项

#info-box(
  title: "全局函数污染",
  type: "warning",
)[
  `loadSaveList` 方法会定义全局函数 `window.loadSelectedSave` 和 `window.deleteSave` 用于处理点击事件。这是为了支持 `onclick` 属性的 HTML 事件绑定。在多次调用 `loadSaveList` 时，这些全局函数会被覆盖。
]

#info-box(
  title: "用户登录状态",
  type: "warning",
)[
  所有存档操作都依赖于当前用户名（`localStorage['rewind-pearl-username']`）。如果用户未登录，`loadSaveList` 会显示"用户未登录"提示。确保在使用存档系统前完成用户登录流程。
]

#info-box(
  title: "存档数据结构",
  type: "info",
)[
  SaveManager 只负责 UI 和交互逻辑，不负责存档数据的生成和验证。存档数据的结构应由游戏主逻辑定义，并确保序列化和反序列化的正确性。
]

#info-box(
  title: "页面刷新行为",
  type: "info",
)[
  加载存档时，默认做法是将存档数据写入自动存档槽（`rewind-pearl-autosave-{username}`），然后调用 `location.reload()` 刷新页面。这会导致当前游戏状态丢失，确保在刷新前已保存必要数据。
]

#info-box(
  title: "存档数量限制",
  type: "warning",
)[
  `localStorage` 有容量限制（通常 5-10MB），大量存档可能导致存储失败。建议：
  - 限制单个用户的存档数量（如最多 20 个）
  - 提供存档清理或自动清理功能
  - 压缩存档数据或使用 IndexedDB 替代
]

= 技术细节

== 静态类设计

```js
class SaveManager {
  // 所有方法都是静态方法
  static loadSaveList(container, onLoad, onDelete) { /* ... */ }
  static showSavePrompt(onSave) { /* ... */ }
  static formatTime(timestamp) { /* ... */ }
}

export default SaveManager
```

优点：
- 无需实例化，直接通过类名调用
- 无内部状态，避免状态管理复杂性
- 适合工具函数的组织方式

== 全局函数注入

为了支持 HTML 的 `onclick` 属性，`loadSaveList` 动态定义全局函数：

```js
window.loadSelectedSave = (username, saveIndex) => {
  const savingsData = localStorage.getItem('rewind-pearl-savings')
  const savings = JSON.parse(savingsData)
  const selectedSave = savings[username][saveIndex]
  if (onLoad) onLoad(selectedSave.data)
}

window.deleteSave = (username, saveIndex) => {
  if (!confirm('确定要删除这个存档吗？')) return
  // ... 删除逻辑
  if (onDelete) onDelete(selectedSave.name)
  // 重新加载列表
  this.loadSaveList(container, onLoad, onDelete)
}
```

#info-box(
  title: "替代方案",
  type: "info",
)[
  如果担心全局函数污染，可以改用事件委托：在容器上监听点击事件，根据 `event.target` 判断点击的是哪个存档项。
]

== 时间格式化实现

```js
static formatTime(timestamp) {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

使用 `toLocaleString` 确保本地化格式，自动处理时区和语言。

== 依赖关系

`SaveManager.js` 不依赖项目中的其他模块，但被以下模块使用：

- `PauseManager.js`：暂停菜单中的存档加载和保存
- 主菜单模块：游戏开始前的存档选择
- 游戏主逻辑：保存和加载游戏状态

== 与游戏主逻辑的协作

```
SaveManager (UI/交互)
      ↓ 用户选择存档
      ↓
Game.saveGame() / Game.loadGame() (数据处理)
      ↓
localStorage (持久化存储)
```

SaveManager 负责前端交互，游戏主逻辑负责数据的序列化和反序列化。

== 存档列表更新机制

删除存档后，`deleteSave` 会自动调用 `loadSaveList` 重新渲染列表：

```js
window.deleteSave = (username, saveIndex) => {
  // ... 删除逻辑
  
  // 重新加载列表以刷新 UI
  this.loadSaveList(container, onLoad, onDelete)
}
```

这确保了 UI 与数据的同步，用户删除后立即看到更新的列表。
