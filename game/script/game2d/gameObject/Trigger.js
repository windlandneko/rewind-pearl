import { BaseObject } from './BaseObject.js'
import Vec2 from '../Vector.js'

export class Trigger extends BaseObject {
  playerInteract = new WeakMap() // 这还是JS吗，给我干哪来了

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

  async interactWithPlayer(player, game) {
    if (player.removed) return
    if (player.checkCollision(this)) {
      await this.trigger(1, player, game)
    } else {
      await this.trigger(0, player, game)
    }
  }

  async trigger(type, player, game) {
    const $ = name => game.ref(name)

    if (type === 1) {
      if (!this.playerInteract.get(player)) {
        try {
          await this.enterCallback?.(game, $)
        } catch (e) {
          console.error(e)
          this.triggerOnce = true
        }
        this.playerInteract.set(player, true)
      }
      if (this.triggerOnce) this.enterCallback = null
    }
    if (type === 0) {
      if (this.playerInteract.get(player)) {
        try {
          await this.leaveCallback?.(game, $)
        } catch (e) {
          console.error(e)
          this.triggerOnce = true
        }
        this.playerInteract.set(player, false)
      }
      if (this.triggerOnce) this.leaveCallback = null
    }
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
      enterCallback: this.enterCallback?.toString?.(),
      leaveCallback: this.leaveCallback?.toString?.(),
      triggerOnce: this.triggerOnce,
    }
  }

  set state(state) {
    super.state = state
    this.enterCallback = eval(state.enterCallback)
    this.leaveCallback = eval(state.leaveCallback)
    this.triggerOnce = state.triggerOnce
  }
}
