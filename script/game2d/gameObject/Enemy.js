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
    this.type = 'enemy'
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

  /**
   * 敌人与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game) {
    if (!player.checkCollision(this) || player.damageTimer > 0) {
      return
    }

    // 降落+在敌人上方
    if (player.v.y > 0 && player.r.y + player.height < this.r.y + this.height) {
      this.removed = true
      player.v.y = -player.jumpSpeed * 0.6 // 小跳跃
      player.score += 100
    } else {
      // 玩家受伤
      player.takeDamage()
    }
  }

  render(ctx, scale) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    ctx.fillStyle = 'red'
    ctx.fillRect(x, y, this.width, this.height)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '9px FiraCode, monospace'
    const debugY = y + 30
    ctx.fillText(
      `pos: (${this.r.x.toFixed(1)}, ${this.r.y.toFixed(1)})`,
      x,
      debugY
    )
    ctx.fillText(
      `vel: (${this.v.x.toFixed(1)}, ${this.v.y.toFixed(1)})`,
      x,
      debugY + 10
    )
    ctx.fillText(`speed: ${this.v.len().toFixed(1)}`, x, debugY + 20)
  }
}
