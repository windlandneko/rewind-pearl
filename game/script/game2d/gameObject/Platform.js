import { BaseObject } from './BaseObject.js'

export class Platform extends BaseObject {
  color = '#666'
  shadowColor = '#6666'

  constructor(x, y, width, height) {
    super(x, y, width, height)
  }

  /**
   * 平台与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game) {
    if (!this.checkCollision(player) || player.removed) return

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

    // 根据重叠方向调整位置和速度
    if (minOverlap === overlapTop) {
      // 从上方碰撞（着地）
      player.r.y = this.r.y - player.height
      player.v.y = 0
      player.onGround = true
    } else if (minOverlap === overlapBottom) {
      // 从下方碰撞（撞头）
      player.r.y = this.r.y + this.height
      player.v.y = 0
    } else if (minOverlap === overlapLeft) {
      // 从左侧碰撞
      player.r.x = this.r.x - player.width
      player.v.x = 0
    } else if (minOverlap === overlapRight) {
      // 从右侧碰撞
      player.r.x = this.r.x + this.width
      player.v.x = 0
    }
  }

  render(ctx, { scale }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    ctx.fillStyle = this.shadowColor
    ctx.fillRect(x - 2, y + 1, this.width + 2, this.height)
    ctx.fillRect(x - 1, y, this.width, this.height + 2)
    ctx.fillStyle = this.color
    ctx.fillRect(x - 1, y, this.width + 2, this.height)
    ctx.fillRect(x, y - 1, this.width, this.height + 2)
  }
}
