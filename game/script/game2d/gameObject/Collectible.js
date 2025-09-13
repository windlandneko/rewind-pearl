import { BaseObject } from './BaseObject.js'

export class Collectible extends BaseObject {
  color = '#FFC107'
  bobOffset = 0

  constructor(x, y, spriteId) {
    super(x, y, 8, 8)
  }

  update(dt) {
    this.bobOffset += dt
  }

  interactWithPlayer(player, game) {
    if (player.checkCollision(this)) {
      this.removed = true
      player.score += 1
    }
  }

  render(ctx) {
    if (Asset.has(this.spriteId)) {
      const sprite = Asset.get(this.spriteId)
      const dy = this.height + Math.sin(this.bobOffset) * 3
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
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
  }
}
