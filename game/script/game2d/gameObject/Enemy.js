import Vec2 from '../Vector.js'
import { BaseObject } from './BaseObject.js'

export class Enemy extends BaseObject {
  color = '#FF5722'
  speed = 20
  direction = 1
  patrolRange = 100
  bobOffset = Math.random() * 100

  constructor(x, y) {
    super(x, y, 8, 8)
    this.anchor = new Vec2(x, y)
  }

  update(dt) {
    this.bobOffset += dt * 2

    this.v.x = this.speed * this.direction
    this.r.x += this.v.x * dt
    this.r.y = this.anchor.y + Math.sin(this.bobOffset) * 2

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
    if (!player.checkCollision(this) || player.removed) return

    // 降落 + 在敌人上方
    if (player.v.y > 0 && player.r.y + player.height < this.r.y + this.height) {
      this.removed = true
      player.v.y = -player.jumpSpeed * 0.6 // 小跳跃
      player.score += 100
    } else {
      // 玩家受伤
      player.onDamage()
    }
  }

  render(ctx, scale) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    ctx.fillStyle = 'red'
    ctx.fillRect(x, y, this.width, this.height)
  }

  get state() {
    return {
      ...super.state,
      direction: this.direction,
      bobOffset: this.bobOffset,
      speed: this.speed,
      patrolRange: this.patrolRange,
      anchorX: this.anchor.x,
      anchorY: this.anchor.y,
    }
  }

  set state(state) {
    super.state = state
    this.direction = state.direction
    this.bobOffset = state.bobOffset
    this.speed = state.speed
    this.patrolRange = state.patrolRange
    this.anchor.x = state.anchorX
    this.anchor.y = state.anchorY
  }
}
