// ============================================================================
// Sprite.js 模块文档
// rewind-pearl 游戏引擎 - 精灵图动画系统
// ============================================================================

#import "template.typ": *

#show: initialize-document

#metadata(
  title: "Sprite.js 文档",
  subtitle: "精灵图动画系统",
  authors: ("windlandneko",),
)

#outline(title: "目录", indent: auto)

= 模块介绍

`Sprite.js` 提供基于时间的精灵图（Sprite Sheet）动画播放系统。通过将多帧动画图片排列在一张图上，该模块可以按照指定的时间间隔自动切换帧，实现流畅的 2D 动画效果。

== 核心特性

- *基于时间的帧播放*：防止帧率波动影响动画速度
- *循环控制*：支持循环播放和单次播放
- *播放控制*：播放、暂停、停止、重置
- *帧精确控制*：可手动设置当前帧
- *完成状态检测*：判断非循环动画是否播放完毕

= API 参考

#api(
  name: "new SpriteAnimation(spriteSheet, frameCount, frameWidth, frameHeight, frameDuration, loop)",
  description: "创建精灵图动画实例。",
  parameters: (
    (name: "spriteSheet", type: "HTMLImageElement", description: "精灵图图片对象"),
    (name: "frameCount", type: "number", description: "总帧数"),
    (name: "frameWidth", type: "number", optional: true, description: "每帧宽度（默认 32）"),
    (name: "frameHeight", type: "number", optional: true, description: "每帧高度（默认 32）"),
    (name: "frameDuration", type: "number", optional: true, description: "每帧持续时间（毫秒，默认使用配置值 100ms）"),
    (name: "loop", type: "boolean", optional: true, description: "是否循环播放（默认 true）"),
  ),
  returns: (type: "SpriteAnimation", description: "动画实例"),
  example: ```js
  import Asset from './Asset.js'
  
  const sheet = Asset.get('character/player/run')
  const runAnim = new SpriteAnimation(sheet, 8, 32, 32, 100, true)
  ```,
)

#api(
  name: "update(deltaTime)",
  description: "更新动画状态，根据时间推进帧。",
  parameters: (
    (name: "deltaTime", type: "number", description: "帧间隔时间（秒）"),
  ),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  gameLoop(dt) {
    animation.update(dt)
    animation.render(ctx, x, y)
  }
  ```,
)

#api(
  name: "render(ctx, x, y, width, height)",
  description: "渲染当前帧到画布。",
  parameters: (
    (name: "ctx", type: "CanvasRenderingContext2D", description: "画布上下文"),
    (name: "x", type: "number", description: "绘制 X 坐标"),
    (name: "y", type: "number", description: "绘制 Y 坐标"),
    (name: "width", type: "number", optional: true, description: "绘制宽度（默认使用帧宽度）"),
    (name: "height", type: "number", optional: true, description: "绘制高度（默认使用帧高度）"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "play() / pause() / stop()",
  description: [控制动画播放。`play()` 开始播放，`pause()` 暂停，`stop()` 停止并重置。],
  parameters: (),
  returns: (type: "null", description: "无返回值"),
  example: ```js
  animation.play()
  animation.pause()
  animation.stop()
  ```,
)

#api(
  name: "reset()",
  description: "重置动画到第一帧。",
  parameters: (),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "setFrame(frame)",
  description: "设置当前帧索引。",
  parameters: (
    (name: "frame", type: "number", description: "帧索引（0 开始）"),
  ),
  returns: (type: "null", description: "无返回值"),
)

#api(
  name: "isComplete()",
  description: "检查非循环动画是否播放完毕。",
  parameters: (),
  returns: (type: "boolean", description: "是否完成"),
)

= 使用场景

== 场景 1：角色动画管理器

配合 `AnimationManager.js` 使用：

```js
import SpriteAnimation from './Sprite.js'
import AnimationManager from './Animation.js'
import Asset from './Asset.js'

class Player {
  constructor() {
    this.animManager = new AnimationManager()
    
    // 添加多个动画状态
    this.animManager.addAnimation('idle', 
      new SpriteAnimation(Asset.get('character/player/idle'), 4, 32, 32, 150)
    )
    this.animManager.addAnimation('run',
      new SpriteAnimation(Asset.get('character/player/run'), 8, 32, 32, 100)
    )
    this.animManager.addAnimation('jump',
      new SpriteAnimation(Asset.get('character/player/jump'), 6, 32, 32, 80, false)
    )
    
    this.animManager.playAnimation('idle')
  }
  
  update(dt) {
    // 根据状态切换动画
    if (this.isMoving) {
      this.animManager.playAnimation('run')
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

== 场景 2：单次播放动画

```js
const explosionAnim = new SpriteAnimation(
  Asset.get('effects/explosion'),
  12,  // 12 帧爆炸动画
  64, 64,
  50,   // 每帧 50ms
  false // 不循环
)

explosionAnim.play()

function update(dt) {
  explosionAnim.update(dt)
  
  if (explosionAnim.isComplete()) {
    // 动画播放完毕，移除特效
    removeEffect()
  }
}
```

= 技术细节

精灵图格式要求：
- 所有帧水平排列在一行
- 每帧尺寸相同
- 从左到右按播放顺序排列

内部使用 `elapsedTime` 累计时间，当超过 `frameDuration` 时切换到下一帧，确保动画速度不受帧率影响。

依赖 `GameConfig.js` 中的 `SPRITE_FRAME_DURATION` 作为默认帧时长。
