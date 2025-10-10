// ============================================================================
// GameConfig.js 模块文档
// rewind-pearl 游戏引擎 - 游戏配置常量
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "GameConfig.js 文档",
  subtitle: "游戏配置常量",
  authors: ("windlandneko",),
)

= 模块介绍

`GameConfig.js` 定义了游戏引擎的核心配置常量，包括逻辑更新频率、时间回溯参数、渲染配置和动画配置。这些常量在整个游戏引擎中被广泛引用。

#info-box(
  type: "warning",
)[
  - 修改 `UPDATE_PER_SECOND` 会影响游戏的物理模拟精度和性能
  - 修改 `MAX_SNAPSHOTS_COUNT` 会影响内存占用和可回溯的时间长度
]

= 配置项说明

== 逻辑更新配置

#styled-table(
  columns: (2fr, 1fr, 3fr),
  headers: ([常量名], [默认值], [说明]),
  rows: (
    ([`UPDATE_PER_SECOND`], [`120`], [每秒逻辑更新次数（逻辑帧率）]),
    ([`UPDATE_INTERVAL`], [`8.33ms`], [逻辑帧更新间隔时间（毫秒）]),
  ),
  caption: [逻辑更新配置],
)

== 时间回溯配置

#styled-table(
  columns: (2fr, 1fr, 3fr),
  headers: ([常量名], [默认值], [说明]),
  rows: (
    ([`MAX_SNAPSHOTS_COUNT`], [`72000`], [最大快照记录数（600秒×120帧）]),
    ([`TIME_TRAVEL_CHARGE_TIME`], [`120`], [时间回溯充能时间（逻辑帧数）]),
  ),
  caption: [时间回溯配置],
)

== 渲染配置

#styled-table(
  columns: (2fr, 1fr, 3fr),
  headers: ([常量名], [默认值], [说明]),
  rows: (
    ([`GRID_SIZE`], [`8`], [网格大小（像素），地图图块的基础单位]),
  ),
  caption: [渲染配置],
)

== 动画配置

#styled-table(
  columns: (2fr, 1fr, 3fr),
  headers: ([常量名], [默认值], [说明]),
  rows: (
    ([`TRANSITION_DURATION`], [`500ms`], [关卡切换黑屏过渡时间]),
    ([`SPRITE_FRAME_DURATION`], [`100ms`], [精灵图默认每帧持续时间]),
  ),
  caption: [动画配置],
)

= 使用示例

== 按需导入

```js
import { UPDATE_INTERVAL, GRID_SIZE } from './GameConfig.js'

class Game {
  constructor() {
    this.updateInterval = UPDATE_INTERVAL
    this.tileSize = GRID_SIZE
  }
}
```

== 全部导入

```js
import * as GameConfig from './GameConfig.js'

class Game {
  constructor() {
    this.updateInterval = GameConfig.UPDATE_INTERVAL
    this.tileSize = GameConfig.GRID_SIZE
  }
}
```
