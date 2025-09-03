import { AABBObject } from './AABBObject.js'

export class Collectible extends AABBObject {
  constructor(x, y) {
    super(x, y, 20, 20)
    this.type = 'collectible'
    this.color = '#FFC107'
    this.bonus = 10
    this.bobOffset = 0
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
