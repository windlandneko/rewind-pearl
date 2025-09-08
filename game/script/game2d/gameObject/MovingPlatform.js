import { Platform } from './Platform.js'
import Vec2 from '../Vector.js'

export class MovingPlatform extends Platform {
  timer = 0
  deltaPosition = null

  constructor(from, to, width, height, interval) {
    super(from?.x, from?.y, width, height)
    this.r = this.from = from ?? new Vec2()
    this.to = to ?? new Vec2()
    this.interval = interval
    this.deltaPosition = new Vec2(0, 0)
  }

  update(dt) {
    // 记录平台移动前的位置
    const oldPosition = new Vec2(this.r.x, this.r.y)

    // 更新平台位置
    this.timer += dt
    this.r = this.to
      .sub(this.from)
      .mul(Math.sin((this.timer / this.interval) * Math.PI * 2) / 2 + 0.5)
      .add(this.from)

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
      fromX: this.from.x,
      fromY: this.from.y,
      toX: this.to.x,
      toY: this.to.y,
      interval: this.interval,
      timer: this.timer,
      deltaPositionX: this.deltaPosition?.x || 0,
      deltaPositionY: this.deltaPosition?.y || 0,
    }
  }

  set state(state) {
    super.state = state
    this.from = new Vec2(state.fromX, state.fromY)
    this.to = new Vec2(state.toX, state.toY)
    this.interval = state.interval
    this.timer = state.timer
    this.deltaPosition = new Vec2(
      state.deltaPositionX || 0,
      state.deltaPositionY || 0
    )
  }
}
