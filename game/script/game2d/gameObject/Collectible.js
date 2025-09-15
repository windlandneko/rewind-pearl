import { BaseObject } from './BaseObject.js'
import Asset from '../../Asset.js'

export class Collectible extends BaseObject {
  color = '#FFC107'
  bobOffset = 0

  constructor(x, y, spriteId) {
    super(x, y, 10, 10)
    this.spriteId = spriteId
  }

  update(dt) {
    this.bobOffset += dt
  }

  interactWithPlayer(player, game) {
    if (this.collected) return
    if (player.checkCollision(this) && !player.removed) {
      this.collected = true
      game.sound.play('lgods' + Math.ceil(Math.random() * 4))
    }
  }

  render(ctx, { scale, tick }) {
    if (this.collected) return

    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    if (Asset.has(this.spriteId)) {
      const sprite = Asset.get(this.spriteId)
      const width = this.width
      const height = (sprite.height / sprite.width) * width
      const dy = Math.sin(this.bobOffset * 3) - 1
      ctx.drawImage(
        sprite,
        x - width / 2,
        y + dy + this.height - height,
        width,
        height
      )
    } else {
      ctx.save()
      ctx.fillStyle = '#0ff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 16

      const radius = 6
      ctx.beginPath()
      ctx.arc(x + this.width / 2, y + this.height / 2, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  get state() {
    return {
      ...super.state,
      bobOffset: this.bobOffset,
      spriteId: this.spriteId,
      collected: this.collected,
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
    this.spriteId = state.spriteId
    this.collected = state.collected
  }
}
