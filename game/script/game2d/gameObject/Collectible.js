import { BaseObject } from './BaseObject.js'
import Asset from '../../Asset.js'

export class Collectible extends BaseObject {
  color = '#FFC107'
  bobOffset = 0

  constructor(x, y, spriteId) {
    super(x, y, 8, 8)
    this.spriteId = spriteId
  }

  update(dt) {
    this.bobOffset += dt
  }

  interactWithPlayer(player, game) {
    if (player.checkCollision(this) && !player.removed) {
      this.removed = true
      player.score += 1
    }
  }

  render(ctx) {
    if (Asset.has(this.spriteId)) {
      const sprite = Asset.get(this.spriteId)
      const dy = this.height + Math.sin(this.bobOffset) * 2
      ctx.drawImage(
        sprite,
        this.r.x,
        this.r.y + dy,
        this.width,
        this.height + dy
      )
    } else {
      ctx.fillStyle = '#ff845eff'
      ctx.fillRect(this.r.x, this.r.y, this.width, this.height)
    }
  }

  get state() {
    return {
      ...super.state,
      bobOffset: this.bobOffset,
      spriteId: this.spriteId,
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
    this.spriteId = state.spriteId
  }
}
