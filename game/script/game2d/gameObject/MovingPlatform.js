import { Platform } from './Platform.js'
import Vec2 from '../Vector.js'

export class MovingPlatform extends Platform {
  timer = 0
  target = 0
  color = '#fafafa'

  /**
   * 移动平台
   * @param {Vec2} from
   * @param {Vec2} to
   * @param {number} width
   * @param {number} height
   * @param {number} interval
   * @param {string} moveType
   */
  constructor(from, to, width, height, ladder = false, interval = 5, moveType = 'still') {
    super(from?.x ?? 0, from?.y ?? 0, width, height, ladder)
    this.r = this.from = from ?? new Vec2()
    this.to = to ?? new Vec2()
    this.interval = interval
    this.moveType = moveType
  }

  set(position) {
    if (this.moveType === 'still') this.target = position
    return this
  }

  get moveFunction() {
    const k = this.timer / this.interval
    switch (this.moveType) {
      case 'linear':
        return Math.abs(2 * (k % 1) - 1)
      case 'sin':
        return Math.sin(2 * Math.PI * k) / 2 + 0.5
      case 'random':
        return Math.random()
      default:
        return 0
    }
  }

  update(dt) {
    // 记录平台移动前的位置
    const oldPosition = new Vec2(this.r.x, this.r.y)

    // 更新平台位置
    this.timer += dt
    if (this.moveType === 'still') {
      let k = this.r.sub(this.from).len() / this.to.sub(this.from).len()
      if (k < this.target) k = Math.min(1, k + dt / this.interval)
      if (k > this.target) k = Math.max(0, k - dt / this.interval)

      this.r = this.to.sub(this.from).mul(k).add(this.from)
    } else {
      this.r = this.to.sub(this.from).mul(this.moveFunction).add(this.from)
    }

    // 计算平台的移动向量
    this.v = this.r.sub(oldPosition)
  }

  /**
   * 移动平台与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game, dt) {
    super.interactWithPlayer(player, game, dt)

    // 如果玩家站在平台上，让玩家跟随平台移动
    if (this.checkCollision(player.groundCheckBox)) {
      player.r.addTo(this.v)
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
      moveType: this.moveType,
      timer: this.timer,
      target: this.target,
    }
  }

  set state(state) {
    super.state = state
    this.from = new Vec2(state.fromX, state.fromY)
    this.to = new Vec2(state.toX, state.toY)
    this.interval = state.interval
    this.moveType = state.moveType
    this.timer = state.timer
    this.target = state.target
  }
}
