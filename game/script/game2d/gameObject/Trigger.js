import { BaseObject } from './BaseObject.js'
import Vec2 from '../Vector.js'

export class Trigger extends BaseObject {
  interacting = false
  lastInteracting = false

  /**
   * 触发器对象
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} triggerOnce
   * @param {function} onEnter
   * @param {function} onLeave
   */
  constructor(x, y, width, height, triggerOnce, onEnter, onLeave) {
    super(x, y, width, height)
    this.triggerOnce = triggerOnce
    this.enterCallback = onEnter
    this.leaveCallback = onLeave
  }

  interactWithPlayer(player, game) {
    if (player.removed) return

    this.interacting |= this.checkCollision(player)
  }

  async trigger(game) {
    const $ = name => game.ref(name)

    if (!this.lastInteracting && this.interacting) {
      try {
        await this.enterCallback?.call(this, game, $)
      } catch (e) {
        console.error(e)
        this.triggerOnce = true
      }
      if (this.triggerOnce) this.enterCallback = null
    }
    if (this.lastInteracting && !this.interacting) {
      try {
        await this.leaveCallback?.call(this, game, $)
      } catch (e) {
        console.error(e)
        this.triggerOnce = true
      }
      if (this.triggerOnce) this.leaveCallback = null
    }
    this.lastInteracting = this.interacting
  }

  render(ctx, { scale }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    ctx.fillStyle = '#f2de32'
    ctx.fillRect(x, y, this.width, this.height)
  }

  get state() {
    return {
      ...super.state,
      ec: this.enterCallback?.toString?.(),
      lc: this.leaveCallback?.toString?.(),
      to: this.triggerOnce,
      i: this.interacting,
      li: this.lastInteracting,
    }
  }

  set state(state) {
    super.state = state
    this.enterCallback = eval(state.ec)
    this.leaveCallback = eval(state.lc)
    this.triggerOnce = state.to
    this.interacting = state.i
    this.lastInteracting = state.li
  }
}
