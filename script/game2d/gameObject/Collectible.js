import { BaseObject } from './BaseObject.js'

export class Collectible extends BaseObject {
  type = 'collectible'
  color = '#FFC107'
  bonus = 10
  bobOffset = 0

  constructor(x, y) {
    super(x, y, 8, 8)
  }

  update(dt) {
    // 上下浮动效果
    this.bobOffset += dt
  }

  interactWithPlayer(player, game) {
    if (player.checkCollision(this)) {
      this.removed = true
      player.score += this.bonus
    }
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
