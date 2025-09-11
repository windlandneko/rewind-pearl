import { Platform } from './Platform.js'
import Vec2 from '../Vector.js'

export class CrazyPlatform extends Platform {
  deltaPosition = null

  update(dt) {
    // 记录平台移动前的位置
    const oldPosition = new Vec2(this.r.x, this.r.y)

    // 更新平台位置
    this.r.addTo(new Vec2(Math.random(), Math.random()).sub(0.5, 0.5).mul(0.4))

    // 计算平台的移动向量
    this.deltaPosition = this.r.sub(oldPosition)
  }

  /**
   * 移动平台与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game) {
    super.interactWithPlayer(player, game)

    // 如果玩家站在平台上，让玩家跟随平台移动
    if (this.checkCollision(player.groundCheckBox) && this.deltaPosition) {
      player.r.addTo(this.deltaPosition)
    }
  }

  get state() {
    return {
      ...super.state,
      deltaPositionX: this.deltaPosition?.x || 0,
      deltaPositionY: this.deltaPosition?.y || 0,
    }
  }

  set state(state) {
    super.state = state
    this.deltaPosition = new Vec2(
      state.deltaPositionX || 0,
      state.deltaPositionY || 0
    )
  }
}
