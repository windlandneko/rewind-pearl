// ============================================================================
// Camera.js 模块文档
// rewind-pearl 游戏引擎 - 2D 摄像机系统
// ============================================================================

#import "../template.typ": *

#show: initialize-document(
  title: "Camera.js",
  subtitle: "2D 摄像机系统",
  authors: ("windlandneko",),
)

= 模块介绍

`Camera.js` 实现了功能完善的 2D 摄像机系统，提供平滑跟随、边界限制、震动效果等特性。摄像机负责将游戏世界坐标转换为屏幕坐标，是游戏渲染系统的核心组件。

== 核心特性

- *目标跟随*：平滑跟随游戏对象，支持自定义跟随边距
- *世界边界*：限制摄像机移动范围，防止显示边界外内容
- *平滑插值*：使用线性插值实现平滑的摄像机移动
- *震动系统*：支持一次性震动和持续微震动效果
- *坐标转换*：提供世界坐标与屏幕坐标的相互转换
- *视野检测*：判断对象是否在摄像机视野内

= API 参考

== 基础配置

#api(
  name: "set target(target)",
  description: "设置摄像机跟随的目标对象。",
  parameters: (
    (name: "target", type: "Object", description: [目标对象，需包含 `r.x`、`r.y`、`width`、`height` 属性]),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  camera.target = player
  ```,
)

#api(
  name: "setViewportSize(width, height)",
  description: "设置摄像机视窗尺寸。",
  parameters: (
    (name: "width", type: "number", description: "视窗宽度"),
    (name: "height", type: "number", description: "视窗高度"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "setPadding(left, right, top, bottom)",
  description: "设置目标跟随边距。当目标超出边距区域时，摄像机开始移动。",
  parameters: (
    (name: "left", type: "number", description: "左边距"),
    (name: "right", type: "number", description: "右边距"),
    (name: "top", type: "number", description: "上边距"),
    (name: "bottom", type: "number", description: "下边距"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  camera.setPadding(100, 100, 80, 80)
  ```,
)

#api(
  name: "setWorldBounds(minX, minY, width, height)",
  description: "设置世界边界，限制摄像机移动范围。",
  parameters: (
    (name: "minX", type: "number", description: "世界最小 X 坐标"),
    (name: "minY", type: "number", description: "世界最小 Y 坐标"),
    (name: "width", type: "number", description: "世界宽度"),
    (name: "height", type: "number", description: "世界高度"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "set smoothFactor(factor)",
  description: "设置平滑跟随插值因子，控制摄像机移动速度。",
  parameters: (
    (name: "factor", type: "number", description: "插值因子（0-1），越大移动越快"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  camera.smoothFactor = 0.1  // 平滑跟随
  camera.smoothFactor = 1    // 瞬间跟随
  ```,
)

== 震动效果

#api(
  name: "shake(intensity, duration, frequency)",
  description: "触发摄像机震动效果。",
  parameters: (
    (name: "intensity", type: "number", optional: true, description: "震动强度（默认 10）"),
    (name: "duration", type: "number", optional: true, description: "持续时间，秒（默认 0.5）"),
    (name: "frequency", type: "number", optional: true, description: "震动频率（默认 50Hz）"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  // 爆炸效果
  camera.shake(20, 0.8, 60)

  // 轻微震动
  camera.shake(5, 0.3, 40)
  ```,
  notes: "震动使用 Perlin 噪声算法生成自然的抖动效果，支持震动叠加。",
)

== 位置控制

#api(
  name: "setPosition(x, y)",
  description: "立即移动摄像机到指定位置，无平滑过渡。",
  parameters: (
    (name: "x", type: "number", description: "X 坐标"),
    (name: "y", type: "number", description: "Y 坐标"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "centerOnTarget()",
  description: "立即将摄像机居中到目标位置。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
)

== 坐标转换

#api(
  name: "worldToScreen(worldX, worldY)",
  description: "将世界坐标转换为屏幕坐标。",
  parameters: (
    (name: "worldX", type: "number", description: "世界 X 坐标"),
    (name: "worldY", type: "number", description: "世界 Y 坐标"),
  ),
  returns: (type: "Vec2", description: "屏幕坐标"),
)

#api(
  name: "screenToWorld(screenX, screenY)",
  description: "将屏幕坐标转换为世界坐标。",
  parameters: (
    (name: "screenX", type: "number", description: "屏幕 X 坐标"),
    (name: "screenY", type: "number", description: "屏幕 Y 坐标"),
  ),
  returns: (type: "Vec2", description: "世界坐标"),
)

#api(
  name: "isInView(object, margin)",
  description: "检查对象是否在摄像机视野内。",
  parameters: (
    (name: "object", type: "Object", description: "游戏对象"),
    (name: "margin", type: "number", optional: true, description: "额外边距（默认 0）"),
  ),
  returns: (type: "boolean", description: "是否在视野内"),
  example: ```js
  if (camera.isInView(enemy, 50)) {
    enemy.update(dt)
  }
  ```,
)

== 更新与渲染

#api(
  name: "update(dt)",
  description: "更新摄像机逻辑位置（目标位置）。",
  parameters: (
    (name: "dt", type: "number", description: "帧间隔时间（秒）"),
  ),
  returns: (type: "null", description: "无返回值"),
  notes: "在游戏逻辑更新阶段调用。",
)

#api(
  name: "renderUpdate()",
  description: "更新摄像机渲染位置，应用平滑插值。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  notes: "在渲染阶段调用，确保平滑的视觉效果。",
)

#api(
  name: "getRenderPosition()",
  description: "获取摄像机实际渲染位置（包含震动偏移）。",
  parameters: (),
  returns: (type: "Vec2", description: "渲染位置"),
)

= 使用场景

== 场景 1：初始化摄像机

```js
class Game {
  constructor() {
    this.camera = new Camera()

    // 基础配置
    this.camera.setViewportSize(800, 600)
    this.camera.setPadding(200, 200, 150, 150)
    this.camera.setWorldBounds(0, 0, 3200, 2400)
    this.camera.smoothFactor = 0.1

    // 设置跟随目标
    this.camera.target = this.player
    this.camera.centerOnTarget()
  }
}
```

== 场景 2：渲染世界

```js
render() {
  const ctx = this.ctx
  const renderPos = this.camera.getRenderPosition()

  ctx.save()
  ctx.scale(this.scale, this.scale)
  ctx.translate(-renderPos.x, -renderPos.y)

  // 渲染游戏对象
  this.gameObjects.forEach(obj => {
    if (this.camera.isInView(obj)) {
      obj.render(ctx)
    }
  })

  ctx.restore()
}
```

== 场景 3：爆炸震动效果

```js
class Explosion {
  explode() {
    // 触发震动
    game.camera.shake(15, 0.6, 50)

    // 播放音效
    SoundManager.play('explosion')
  }
}
```

= 技术细节

== 平滑跟随算法

摄像机使用线性插值实现平滑跟随：

```js
renderUpdate() {
  this.position.addTo(
    this.targetPosition.sub(this.position).mul(this.#lerpFactor)
  )
}
```

== 震动系统

震动基于 2D Perlin 噪声生成自然的抖动效果：

```js
#noise2D(x, y) {
  // 双线性插值噪声
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi

  const n00 = this.#noise(xi, yi)
  const n01 = this.#noise(xi, yi + 1)
  const n10 = this.#noise(xi + 1, yi)
  const n11 = this.#noise(xi + 1, yi + 1)

  const nx0 = this.#smoothStep(n00, n10, xf)
  const nx1 = this.#smoothStep(n01, n11, xf)

  return this.#smoothStep(nx0, nx1, yf)
}
```

震动强度随时间线性衰减，提供持续的微震动效果增强临场感。

== 跟随边距机制

只有当目标超出边距区域时，摄像机才会移动：

```
┌─────────────────────────────────┐
│         top padding             │
│  ┌─────────────────────────┐    │
│  │                         │    │
│L │    Dead Zone (不移动)    │  R │
│  │                         │    │
│  └─────────────────────────┘    │
│       bottom padding            │
└─────────────────────────────────┘
```

这种设计避免摄像机过于频繁移动，提供更稳定的视角。
