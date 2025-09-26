import { BaseObject } from './BaseObject.js'
import Asset from '../../Asset.js'

export class Collectible extends BaseObject {
  color = '#FFC107'
  bobOffset = 0
  collected = false

  constructor(x, y, spriteId, onlyGhostCanCollect = false) {
    super(x, y, 12, 12)
    this.spriteId = spriteId
    this.onlyGhostCanCollect = onlyGhostCanCollect
  }

  update(dt) {
    this.bobOffset += dt
  }

  interactWithPlayer(player, game) {
    if (this.collected) return
    if (player.checkCollision(this) && !player.removed) {
      if (this.onlyGhostCanCollect && player.type !== 'GhostPlayer') return
      this.collected = true
      game.sound.play('lgods' + Math.ceil(Math.random() * 4))
    }
  }

  render(ctx, { scale, debug }) {
    if (this.collected) return

    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    if (Asset.has(this.spriteId)) {
      const sprite = Asset.get(this.spriteId)
      const width = this.width
      const height = (sprite.height / sprite.width) * width
      const dy = Math.sin(this.bobOffset * 3)
      ctx.drawImage(sprite, x, y + dy, width, height)
    } else {
      ctx.save()
      ctx.fillStyle = '#0ff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 16

      const radius = 6
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    if (debug) {
      ctx.strokeStyle = '#ff00ffff'
      ctx.strokeRect(x, y, this.width, this.height)
    }
  }

  get state() {
    return {
      ...super.state,
      b: this.bobOffset,
      s: this.spriteId,
      c: this.collected,
      o: this.onlyGhostCanCollect,
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.b
    this.spriteId = state.s
    this.collected = state.c
    this.onlyGhostCanCollect = state.o
  }
}
