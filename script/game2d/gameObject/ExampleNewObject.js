import { AABBObject } from './AABBObject.js'

/**
 * 示例：新游戏物件类型
 * 展示如何继承AABBObject并实现与玩家的交互
 */
export class ExampleNewObject extends AABBObject {
  type = 'example'
  color = '#00FF00'
  interactionCount = 0

  constructor(x, y) {
    super(x, y, 30, 30)
  }

  update(dt) {
    // 自定义更新逻辑
    // 例如：旋转、移动、状态变化等
  }

  /**
   * 与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game) {
    if (player.checkCollision(this)) {
      this.interactionCount++

      // 示例交互：增加玩家分数
      player.score += 50

      // 如果交互次数达到3次，就移除这个物体
      if (this.interactionCount >= 3) {
        this.removed = true
      }
    }
  }

  render(ctx, scale) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.r.x, this.r.y, this.width, this.height)

    // 显示交互次数
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText(
      this.interactionCount.toString(),
      this.r.x + this.width / 2 - 3,
      this.r.y + this.height / 2 + 3
    )
  }
}
