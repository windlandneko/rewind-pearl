import { AABBObject } from './AABBObject.js'

export class Collectible extends AABBObject {
  constructor(x, y) {
    super(x, y, 20, 20)
    this.color = '#FFC107'
    this.value = 10
    this.bobOffset = 0
  }

  update(dt) {
    // 上下浮动效果
    this.bobOffset += dt
  }

  render(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(
      this.r.x,
      this.r.y + Math.sin(this.bobOffset) * 3,
      this.width,
      this.height
    )
  }
}
