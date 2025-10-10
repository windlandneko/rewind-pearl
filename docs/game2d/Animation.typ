// ============================================================================
// Animation.js 模块文档
// rewind-pearl 游戏引擎 - 动画状态管理器
// ============================================================================

#import "template.typ": *

#show: initialize-document(
  title: "Animation.js",
  subtitle: "动画状态管理器",
  authors: ("windlandneko",),
)

= 模块介绍

`AnimationManager` 用于管理游戏对象的多个动画状态（如idle、run、jump等），提供动画状态切换和播放控制功能。该模块与 `SpriteAnimation` 配合使用，实现复杂的角色动画系统。

== 核心特性

- *多状态管理*：管理多个命名的动画状态
- *平滑切换*：自动暂停旧动画，重置并播放新动画
- *智能播放*：避免重复播放同一动画
- *统一接口*：提供统一的 update 和 render 方法

= API 参考

#api(
  name: "addAnimation(name, animation)",
  description: "添加一个命名的动画状态。",
  parameters: (
    (name: "name", type: "string", description: "动画名称"),
    (name: "animation", type: "SpriteAnimation", description: "动画对象"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  const manager = new AnimationManager()
  manager.addAnimation('idle', idleAnim)
  manager.addAnimation('run', runAnim)
  ```,
)

#api(
  name: "playAnimation(name, force)",
  description: "播放指定动画。如果当前已在播放该动画且 force 为 false，则不重复播放。动画不存在时会输出警告。",
  parameters: (
    (name: "name", type: "string", description: "动画名称"),
    (name: "force", type: "boolean", optional: true, description: "是否强制重新播放（默认 false）"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  manager.playAnimation('run')
  manager.playAnimation('jump', true)  // 强制重播
  ```,
)

#api(
  name: "update(deltaTime)",
  description: "更新当前播放的动画。",
  parameters: (
    (name: "deltaTime", type: "number", description: "帧间隔时间（秒）"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "render(ctx, x, y, width, height)",
  description: "渲染当前动画帧。",
  parameters: (
    (name: "ctx", type: "CanvasRenderingContext2D", description: "画布上下文"),
    (name: "x", type: "number", description: "绘制 X 坐标"),
    (name: "y", type: "number", description: "绘制 Y 坐标"),
    (name: "width", type: "number", description: "绘制宽度"),
    (name: "height", type: "number", description: "绘制高度"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "getCurrentAnimationName()",
  description: "获取当前播放的动画名称。",
  parameters: (),
  returns: (type: "string | null", description: "动画名称或 null"),
)

#api(
  name: "isCurrentAnimationComplete()",
  description: "检查当前动画是否播放完毕（仅对非循环动画有效）。",
  parameters: (),
  returns: (type: "boolean", description: "是否完成"),
)

= 使用示例

```js
import AnimationManager from './Animation.js'
import SpriteAnimation from './Sprite.js'

class Character {
  constructor() {
    this.animManager = new AnimationManager()

    // 添加所有动画状态
    this.animManager.addAnimation('idle', new SpriteAnimation(...))
    this.animManager.addAnimation('walk', new SpriteAnimation(...))
    this.animManager.addAnimation('attack', new SpriteAnimation(...))

    this.animManager.playAnimation('idle')
  }

  update(dt) {
    // 根据游戏状态切换动画
    if (this.isAttacking) {
      this.animManager.playAnimation('attack')
    } else if (this.isMoving) {
      this.animManager.playAnimation('walk')
    } else {
      this.animManager.playAnimation('idle')
    }

    this.animManager.update(dt)
  }

  render(ctx) {
    this.animManager.render(ctx, this.x, this.y, 64, 64)
  }
}
```

= 最佳实践

#best-practice(
  bad: ```js
  // 每帧都强制重播
  update(dt) {
    this.animManager.playAnimation('run', true)
  }
  ```,
  good: ```js
  // 让管理器自动判断是否需要切换
  update(dt) {
    this.animManager.playAnimation('run')
  }
  ```,
  explanation: "不使用 force 参数，避免动画每帧都重置。",
)

= 技术细节

`AnimationManager` 内部维护：
- `animations: Map<string, SpriteAnimation>` - 所有动画的映射
- `currentAnimation: SpriteAnimation` - 当前播放的动画对象
- `currentAnimationName: string` - 当前动画名称

切换动画时会自动调用旧动画的 `pause()` 和新动画的 `reset()` + `play()`，确保状态正确。
