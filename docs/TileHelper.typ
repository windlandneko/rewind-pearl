// ============================================================================
// TileHelper.js 模块文档
// rewind-pearl 游戏引擎 - 地图图块系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "TileHelper.js 文档",
  subtitle: "地图图块渲染系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`TileHelper` 是游戏的地图图块渲染系统，负责将 2D 数组形式的地图数据渲染为游戏场景。该模块实现了智能的图块选择算法，可根据周围图块自动选择合适的瓦片纹理，并提供阴影渐变效果。

== 核心特性

- *自动图块选择*：根据周围环境自动选择边角、边缘、中心等不同的图块纹理
- *距离场计算*：计算每个图块到空气的距离，用于阴影效果
- *脏矩形优化*：只重绘发生变化的区域，提升性能
- *多调色板支持*：支持为不同图块类型指定不同的纹理集
- *边缘检测*：预计算墙体边缘，用于碰撞检测优化

= 数据结构

== 地图数据格式

```js
const tileData = [
  [1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 0, 2, 2, 0, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1]
]
```

- `0`：空气（透明）
- `1-9`：不同类型的图块，对应调色板索引

== 图块集 XML 格式

```xml
<Tileset ignores="0">
  <!-- 中心图块 -->
  <set mask="center" tiles="0,0; 1,0; 2,0; 3,0" />
  
  <!-- 四周都有图块的情况 -->
  <set mask="111-111-111" tiles="4,0" />
  
  <!-- 上方和左侧有图块 -->
  <set mask="11-11-0" tiles="0,1" />
  
  <!-- 更多图块模式... -->
</Tileset>
```

= API 参考

#api(
  name: "new TileHelper(tileData, tilePalette)",
  description: "创建地图图块渲染器。",
  parameters: (
    (name: "tileData", type: "number[][]", description: "地图数据，二维数组"),
    (name: "tilePalette", type: "string[]", optional: true, description: "图块纹理调色板，默认全部使用 'default'"),
  ),
  returns: (type: "TileHelper", description: "图块渲染器实例"),
  example: ```js
  const tiles = new TileHelper(
    levelData.tiles,
    ['default', 'grass', 'stone', 'metal']
  )
  ```,
)

#api(
  name: "render(ctx, force)",
  description: "渲染地图图块到画布。使用脏矩形优化，只渲染变化的区域。",
  parameters: (
    (name: "ctx", type: "CanvasRenderingContext2D", description: "画布上下文"),
    (name: "force", type: "boolean", optional: true, description: "是否强制重绘所有图块（默认 false）"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 首次渲染
  tiles.render(tileCtx, true)
  
  // 后续只渲染变化部分
  tiles.render(tileCtx)
  ```,
)

#api(
  name: "set tiles(tiles)",
  description: "更新地图数据，自动标记变化区域为脏。",
  parameters: (
    (name: "tiles", type: "number[][]", description: "新的地图数据"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 修改地图
  tileHelper.tiles = newTileData
  
  // 下次渲染时会自动更新变化的部分
  tileHelper.render(ctx)
  ```,
)

#api(
  name: "edges",
  description: "预计算的墙体边缘矩形数组，用于碰撞检测。",
  parameters: (),
  returns: (type: "number[][]", description: [边缘矩形数组 `[x, y, width, height][]`]),
  example: ```js
  // 物理引擎使用边缘进行碰撞检测
  tileHelper.edges.forEach(([x, y, w, h]) => {
    if (checkCollision(player, x, y, w, h)) {
      // 处理碰撞
    }
  })
  ```,
)

= 渲染特性

== 智能图块选择

系统根据 3×3 邻域的图块分布自动选择合适的纹理：

#styled-table(
  columns: (2fr, 3fr),
  headers: ([场景], [选择策略]),
  rows: (
    ([中心图块], [距离空气 > 2，随机选择 center 集合中的图块]),
    ([填充图块], [距离空气 = 2，随机选择 padding 集合中的图块]),
    ([边缘图块], [根据 mask 模式匹配，选择对应的边角/边缘纹理]),
  ),
  caption: [图块选择策略],
)

== 阴影渐变

使用距离场（Distance Field）实现柔和的阴影效果：

1. 计算每个实心图块到最近空气块的距离
2. 将每个 8×8 图块细分为 4 个 4×4 区域
3. 对每个区域使用双线性插值计算距离值
4. 距离越远，阴影越深，最大透明度 0.6

```
空气 → 距离1 → 距离2 → 距离3+
     浅阴影  中阴影   深阴影
```

== 脏矩形优化

只有发生变化的图块及其周围 3×3 邻域会被标记为脏，下次渲染时只重绘这些区域：

```js
#fill3x3(matrix, i, j, value) {
  // 标记自己和周围 8 个图块为脏
  matrix[i][j] = value
  matrix[i-1][j] = value
  matrix[i+1][j] = value
  // ...
}
```

= 使用场景

== 场景 1：加载关卡地图

```js
import { TileHelper } from './TileHelper.js'

class Level {
  constructor(levelData) {
    this.tiles = new TileHelper(
      levelData.tiles,
      levelData.tilePalette || ['default']
    )
    
    // 创建离屏画布
    this.tileCanvas = document.createElement('canvas')
    this.tileCtx = this.tileCanvas.getContext('2d')
    
    // 首次渲染
    this.tiles.render(this.tileCtx, true)
  }
  
  render(ctx) {
    // 直接绘制预渲染的地图
    ctx.drawImage(this.tileCanvas, 0, 0)
  }
}
```

== 场景 2：动态修改地图

```js
class Game {
  destroyBlock(x, y) {
    // 修改地图数据
    const tileX = Math.floor(x / 8)
    const tileY = Math.floor(y / 8)
    
    const newTiles = this.currentTiles.map(row => [...row])
    newTiles[tileY][tileX] = 0  // 变为空气
    
    // 更新渲染器
    this.tileHelper.tiles = newTiles
    
    // 下次渲染时自动更新
    this.tileHelper.render(this.tileCtx)
  }
}
```

= 技术细节

== 距离场算法

使用 BFS（广度优先搜索）从所有空气块开始向外扩散，计算每个实心块的距离：

```js
#calculateTileDistance() {
  const queue = []
  
  // 初始化：所有空气块距离为 0
  for (let i = 1; i <= this.height; i++) {
    for (let j = 1; j <= this.width; j++) {
      if (this.#tiles[i][j] === 0) {
        queue.push([i, j, 0])
        distance[i][j] = 0
      }
    }
  }
  
  // BFS 扩散
  while (queue.length) {
    const [i, j, d] = queue.pop()
    for (const [di, dj] of directions) {
      const x = i + di, y = j + dj
      if (distance[x][y] > d + 1 && this.#tiles[x][y] > 0) {
        distance[x][y] = d + 1
        queue.push([x, y, d + 1])
      }
    }
  }
}
```

== 边缘提取

使用扫描线算法提取墙体边缘，合并相邻图块为大矩形：

```js
for (let i = 1; i <= this.height; i++) {
  for (let j = 1; j <= this.width; j++) {
    if (!walls[i][j]) continue
    
    // 尝试水平扩展
    let r = j
    while (r <= this.width && walls[i][r]) {
      walls[i][r++] = false
    }
    
    // 如果扩展长度 > 1，添加为边缘
    if (r > j + 1) {
      this.edges.push([x, y, (r - j) * 8, 8])
    }
  }
}
```

== 哈希函数

使用 `hash2D` 为每个位置选择随机但确定的纹理变体：

```js
const tiles = sets.get('center').tiles
return tiles[hash2D(i, j, tiles.length)]
```

相同位置总是选择相同的纹理，但不同位置有不同的变体，实现自然的随机效果。

== 性能优化

- *离屏渲染*：地图渲染到离屏 canvas，游戏循环中直接 `drawImage`
- *脏矩形*：只重绘变化的区域
- *边缘缓存*：碰撞检测用的边缘矩形预先计算并缓存
- *图块缓存*：图块纹理引用存储在 `#paletteMap` 中，避免重复查询
