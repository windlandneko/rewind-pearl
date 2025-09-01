import Vec2 from '../Vector.js'
import { AABBObject } from './AABBObject.js'

export class Enemy extends AABBObject {
  color = '#FF5722'
  speed = 50
  direction = 1
  patrolRange = 100
  bobOffset = Math.random() * 100

  constructor(x, y) {
    super(x, y, 25, 25)
    this.anchor = new Vec2(x, y)
  }

  update(dt) {
    this.bobOffset += dt * 2

    // 简单的左右移动AI
    this.v.x = this.speed * this.direction
    this.r.x += this.v.x * dt
    this.r.y = this.anchor.y + Math.sin(this.bobOffset) * 5

    // 巡逻范围检测，转向
    if (
      this.r.x <= this.anchor.x - this.patrolRange ||
      this.r.x >= this.anchor.x + this.patrolRange
    ) {
      this.direction *= -1
    }
  }

  render(ctx) {
    const pixelX = Math.round(this.r.x)
    const pixelY = Math.round(this.r.y)

    ctx.fillStyle = 'red'
    ctx.fillRect(pixelX, pixelY, this.width, this.height)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '9px FiraCode, monospace'
    const debugY = pixelY + 30
    ctx.fillText(
      `pos: (${this.r.x.toFixed(1)}, ${this.r.y.toFixed(1)})`,
      pixelX,
      debugY
    )
    ctx.fillText(
      `vel: (${this.v.x.toFixed(1)}, ${this.v.y.toFixed(1)})`,
      pixelX,
      debugY + 10
    )
    ctx.fillText(`speed: ${this.v.len().toFixed(1)}`, pixelX, debugY + 20)
  }
}
