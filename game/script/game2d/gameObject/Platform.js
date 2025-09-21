import { BaseObject } from './BaseObject.js'

export class Platform extends BaseObject {
  color = 'rgba(84, 89, 136, 1)'
  shadowColor = 'rgba(84, 89, 136, 0.5)'

  constructor(x, y, width, height, ladder = false) {
    super(x, y, width, height)
    this.ladder = ladder
  }

  /**
   * 平台与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game, dt) {
    if (!this.checkCollision(player) || player.removed) return

    if (this.ladder) {
      if (
        player.walkDown ||
        player.r.y + player.height > this.r.y + player.v.y * dt * 2
      )
        return

      player.onGround = true
      player.r.y = this.r.y - player.height
      player.v.y = 0
      return
    }

    if (this.checkCollision(player.groundCheckBox)) player.onGround = true

    // 计算重叠区域
    const overlapLeft = player.r.x + player.width - this.r.x
    const overlapRight = this.r.x + this.width - player.r.x
    const overlapTop = player.r.y + player.height - this.r.y
    const overlapBottom = this.r.y + this.height - player.r.y

    // 找到最小的重叠方向
    const minOverlap = Math.min(
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom
    )

    if (minOverlap > 4) {
      player.onDamage()
    }

    // 根据重叠方向调整位置和速度
    if (minOverlap === overlapTop) {
      // 从上方碰撞（着地）
      player.r.y = this.r.y - player.height
      player.v.y = this.v.y
      player.onGround = true
    } else if (minOverlap === overlapBottom) {
      // 从下方碰撞（撞头）
      player.r.y = this.r.y + this.height
      player.v.y = -player.v.y * 0.1
      player.v.x = player.v.x * 0.1
    } else if (minOverlap === overlapLeft) {
      // 从左侧碰撞
      player.r.x = this.r.x - player.width
      player.v.x = this.v.x
    } else if (minOverlap === overlapRight) {
      // 从右侧碰撞
      player.r.x = this.r.x + this.width
      player.v.x = this.v.x
    }
  }

  render(ctx, { scale, debug }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    if (this.ladder) {
      ctx.fillStyle = 'rgb(50, 47, 48)'
      ctx.fillRect(x, y - 2, this.width, 1)
      ctx.fillRect(x, y + 1, this.width, 1)
      ctx.fillStyle = 'rgb(174, 133, 99)'
      ctx.fillRect(x, y - 1, this.width, 1)
      ctx.fillStyle = 'rgb(128, 92, 71)'
      ctx.fillRect(x, y, this.width, 1)

      ctx.fillStyle = 'rgb(50, 47, 48)'
      ctx.fillRect(x - 1, y - 1, 1, 2)
      ctx.fillRect(x + this.width, y - 1, 1, 2)
    } else {
      ctx.fillStyle = this.shadowColor
      ctx.fillRect(x - 2, y + 1, this.width + 2, this.height)
      ctx.fillRect(x - 1, y, this.width, this.height + 2)
      ctx.fillStyle = this.color
      ctx.fillRect(x - 1, y, this.width + 2, this.height)
      ctx.fillRect(x, y - 1, this.width, this.height + 2)
    }

    if (debug) {
      ctx.font = '3px Arial'
      ctx.fillText(
        `(${this.v.x.toFixed(1)}, ${this.v.y.toFixed(1)})`,
        x,
        y + 12
      )
    }
  }

  get state() {
    return {
      ...super.state,
      ladder: this.ladder,
    }
  }

  set state(state) {
    super.state = state
    this.ladder = state.ladder
  }
}
