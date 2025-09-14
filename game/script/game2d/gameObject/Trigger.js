import { BaseObject } from './BaseObject.js'
import SoundManager from '../../SoundManager.js'

export class Trigger extends BaseObject {
  lastPlayerIn = new WeakMap()

  /**
   * 触发器对象
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} once
   * @param {function} enterCallback
   * @param {function} leaveCallback
   */
  constructor(x, y, width, height, once, enterCallback, leaveCallback) {
    super(x, y, width, height)
    this.once = once
    this.enterCallback = enterCallback
    this.leaveCallback = leaveCallback
  }

  interactWithPlayer(player, game) {
    if (player.checkCollision(this)) {
      if (!this.lastPlayerIn.get(player)) {
        try {
          this.enterCallback?.(game)
        } catch (e) {
          console.error(e)
          this.once = true
        }
        this.lastPlayerIn.set(player, true)
      }
      if (this.once) this.enterCallback = null
    } else {
      if (this.lastPlayerIn.get(player)) {
        try {
          this.leaveCallback?.(game)
        } catch (e) {
          console.error(e)
          this.once = true
        }
        this.lastPlayerIn.set(player, false)
      }
      if (this.once) this.leaveCallback = null
    }
  }

  get state() {
    return {
      ...super.state,
      enterCallback: this.enterCallback?.toString?.(),
      leaveCallback: this.leaveCallback?.toString?.(),
      once: this.once,
    }
  }

  set state(state) {
    super.state = state
    this.enterCallback = eval(state.enterCallback)
    this.leaveCallback = eval(state.leaveCallback)
    this.once = state.once
  }
}
