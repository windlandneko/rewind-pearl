import { BaseObject } from './BaseObject.js'
import SoundManager from '../../SoundManager.js'

export class Hazard extends BaseObject {
  /**
   * 刺
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} direction - 显示方向
   */
  constructor(x, y, width, height, direction = 'up') {
    super(x, y, width, height)
    this.direction = direction

    this.hitbox = {
      r: this.r.add(3, 3),
      width: this.width - 6,
      height: this.height - 6,
    }

    if (direction === 'up') this.hitbox.r.y += 2
    else if (direction === 'down') this.hitbox.r.y -= 2
    else if (direction === 'left') this.hitbox.r.x += 2
    else if (direction === 'right') this.hitbox.r.x -= 2
  }

  interactWithPlayer(player, game) {
    if (player.removed) return
    if (player.checkCollision(this.hitbox)) {
      player.onDamage()
    }
  }

  render(ctx, { scale, debug }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale
    const width = Math.round(this.width * scale) / scale
    const height = Math.round(this.height * scale) / scale

    const _ = 0
    const a = _ + 3
    const b = a + 2

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    if (this.direction === 'up') {
      for (let i = 0.5; i < width; i += 4) {
        // ctx.fillStyle = 'rgb(255, 0, 0)'
        // ctx.fillRect(x + i, y, 2, 1)
        // ctx.fillStyle = '#fff'
        // ctx.fillRect(x + i, y + 1, 2, 4)
        // ctx.fillStyle = 'rgba(187, 111, 36, 1)'
        // ctx.fillRect(x + i, y + 5, 2, 2)
        ctx.moveTo(x + i + 0, y + height - _)
        ctx.lineTo(x + i + 0, y + height - a)
        ctx.lineTo(x + i + 1, y + height - a)
        ctx.lineTo(x + i + 1, y + height - b)
        ctx.lineTo(x + i + 2, y + height - b)
        ctx.lineTo(x + i + 2, y + height - a)
        ctx.lineTo(x + i + 3, y + height - a)
        ctx.lineTo(x + i + 3, y + height - _)
      }
    } else if (this.direction === 'down') {
      for (let i = 0.5; i < width; i += 4) {
        ctx.moveTo(x + i + 0, y + _)
        ctx.lineTo(x + i + 0, y + a)
        ctx.lineTo(x + i + 1, y + a)
        ctx.lineTo(x + i + 1, y + b)
        ctx.lineTo(x + i + 2, y + b)
        ctx.lineTo(x + i + 2, y + a)
        ctx.lineTo(x + i + 3, y + a)
        ctx.lineTo(x + i + 3, y + _)
      }
    } else if (this.direction === 'left') {
      for (let i = 0.5; i < height; i += 4) {
        ctx.moveTo(x + width - _, y + i + 0)
        ctx.lineTo(x + width - a, y + i + 0)
        ctx.lineTo(x + width - a, y + i + 1)
        ctx.lineTo(x + width - b, y + i + 1)
        ctx.lineTo(x + width - b, y + i + 2)
        ctx.lineTo(x + width - a, y + i + 2)
        ctx.lineTo(x + width - a, y + i + 3)
        ctx.lineTo(x + width - _, y + i + 3)
      }
    } else if (this.direction === 'right') {
      for (let i = 0.5; i < height; i += 4) {
        ctx.moveTo(x + _, y + i + 0)
        ctx.lineTo(x + a, y + i + 0)
        ctx.lineTo(x + a, y + i + 1)
        ctx.lineTo(x + b, y + i + 1)
        ctx.lineTo(x + b, y + i + 2)
        ctx.lineTo(x + a, y + i + 2)
        ctx.lineTo(x + a, y + i + 3)
        ctx.lineTo(x + _, y + i + 3)
      }
    }
    ctx.closePath()
    ctx.fill()

    if (debug) {
      ctx.strokeStyle = '#ff0000ff'
      ctx.strokeRect(
        this.hitbox.r.x,
        this.hitbox.r.y,
        this.hitbox.width,
        this.hitbox.height
      )
    }
  }

  get state() {
    return {
      ...super.state,
      d: this.direction,
    }
  }

  set state(state) {
    super.state = state
    this.direction = state.d
    this.hitbox = {
      r: this.r.add(3, 3),
      width: this.width - 6,
      height: this.height - 6,
    }

    if (this.direction === 'up') this.hitbox.r.y += 2
    else if (this.direction === 'down') this.hitbox.r.y -= 2
    else if (this.direction === 'left') this.hitbox.r.x += 2
    else if (this.direction === 'right') this.hitbox.r.x -= 2
  }
}
